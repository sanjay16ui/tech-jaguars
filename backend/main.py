import os
import io
import base64
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import requests
from sentence_transformers import SentenceTransformer, util
from groq import Groq
import torch

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

# Sentence Transformer model
model_name = "all-MiniLM-L6-v2"
st_model = None
standards_data = []
standards_embeddings = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global st_model, standards_data, standards_embeddings
    try:
        st_model = SentenceTransformer(model_name)
        print("Sentence Transformer loaded.")
        
        # Load dataset
        dataset_path = os.path.join(os.path.dirname(__file__), 'bis_dataset', 'dataset', 'real_bis_standards.json')
        if os.path.exists(dataset_path):
            with open(dataset_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                standards_data = data.get("standards", data) if isinstance(data, dict) else data
            
            # Create embeddings
            texts = [f"{s.get('standard_number', '')} {s.get('full_title', '')} {s.get('product_category', '')}" for s in standards_data]
            standards_embeddings = st_model.encode(texts, convert_to_tensor=True)
            print(f"Loaded {len(standards_data)} standards and computed embeddings.")
    except Exception as e:
        print(f"Failed to load sentence transformer or dataset: {e}")
    yield

app = FastAPI(lifespan=lifespan)

# CORS configuration supporting local development and production (e.g. Vercel deployment)
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:4173",
]
env_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]
# Combine default local origins with any explicitly specified production origins
allowed_origins = list(dict.fromkeys(default_origins + env_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LookupRequest(BaseModel):
    query: str

GROQ_VISION_MODEL = os.getenv("GROQ_VISION_MODEL", "qwen/qwen3.8-27b")

@app.get("/health")
def health_check():
    return {"status": "ok"}

import re
from datetime import datetime

@app.post("/api/lookup")
def lookup_identifier(req: LookupRequest):
    query = req.query.strip().upper()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    # Initialize defaults
    is_standard = "Unknown"
    product_name = "Unknown Product"
    message = "Not verified from available sources. An official authoritative API is not available to confirm this specific licence."
    status = "Could not verify"
    official_link = "https://www.manakonline.in/MANAK/ApplicationStatus"
    query_type = "Unknown"
    time_checked = datetime.utcnow().isoformat()
    evidence_sources = ["Regex Format Validation", "BIS Standards Reference Dataset (SentenceTransformer retrieval)"]

    # 1. Check if it's an ISI/CM-L number
    cml_match = re.match(r'^(?:CM/L-?)?(\d{7,10})$', query.replace(' ', ''))
    
    # 2. Check if it's a CRS R-number
    r_match = re.match(r'^R-?(\d{8})$', query.replace(' ', ''))
    
    # 3. Check if it's a HUID (6 alphanumeric characters)
    huid_match = re.match(r'^[A-Z0-9]{6}$', query.replace(' ', ''))

    if cml_match:
        query_type = "ISI / CM/L Licence"
        cml_number = cml_match.group(1)
        status = "Could not verify"
        message = f"CM/L-{cml_number} is formatted correctly, but official verification requires the BIS portal. No open API provides definitive status."
        official_link = "https://www.manakonline.in/MANAK/ApplicationStatus"
    elif r_match:
        query_type = "CRS R-Number"
        r_number = r_match.group(1)
        status = "Could not verify"
        message = f"R-{r_number} is formatted correctly for Compulsory Registration Scheme (Electronics/IT). Verify via the official CRS portal."
        official_link = "https://www.crsbis.in/BIS/"
    elif huid_match:
        query_type = "HUID (Hallmark Unique Identification)"
        huid = huid_match.group(0)
        status = "Could not verify"
        message = f"HUID {huid} appears to be a valid format. Please use the 'BIS Care App' or the official Hallmark portal to verify."
        official_link = "https://www.bis.gov.in/index.php/hallmarking-overview/"
    else:
        # Fallback to Semantic Search for "Know Your Standards"
        query_type = "Standard Search"
        if st_model and standards_embeddings is not None and len(standards_data) > 0:
            query_embedding = st_model.encode(query, convert_to_tensor=True)
            cos_scores = util.cos_sim(query_embedding, standards_embeddings)[0]
            top_result = torch.topk(cos_scores, k=1)
            best_score = top_result.values[0].item()
            best_idx = top_result.indices[0].item()

            if best_score > 0.4:  # Threshold for a reasonable match
                match = standards_data[best_idx]
                is_standard = match.get("standard_number", "Unknown")
                product_name = match.get("full_title", match.get("product_category", "Unknown Product"))
                status = "Inconclusive"
                message = "Found matching IS Standard based on query, but cannot verify a specific licence or product."
            else:
                status = "Suspicious"
                message = "No matching IS standard or valid licence format found. The provided format does not align with known BIS structures."
                evidence_sources = ["Regex Format Validation (Failed)", "BIS Standards Offline Match (Failed)"]

    return {
        "query": query,
        "query_type": query_type,
        "product": product_name,
        "manufacturer": "Unknown Manufacturer",
        "standard": is_standard,
        "status": status,
        "message": message,
        "evidence_sources": evidence_sources,
        "official_link": official_link,
        "time_checked": time_checked
    }

import cv2
import numpy as np
import pytesseract
import io
from PIL import Image, ImageDraw, ImageFont

@app.post("/api/inspect-image")
async def inspect_image(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (limit 5MB)")

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Groq API key not configured")

    client = Groq(api_key=api_key)
    base64_image = base64.b64encode(contents).decode('utf-8')
    mime_type = file.content_type or "image/jpeg"

    try:
        # Step 1: Extract data using Vision Model
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Extract any visible ISI-mark text, CM/L numbers, IS standard numbers, or product names from this image. Output only a JSON object with keys: 'cml_number', 'is_standard', 'product_name', 'raw_text'. Return null for missing fields."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            model=GROQ_VISION_MODEL,
            response_format={"type": "json_object"}
        )
        result_text = chat_completion.choices[0].message.content
        extracted_data = json.loads(result_text)
        
        # Step 2: Annotate Image using pytesseract
        try:
            image = Image.open(io.BytesIO(contents)).convert('RGB')
            draw = ImageDraw.Draw(image)
            
            # Use tesseract to find bounding boxes
            ocr_data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            
            # Identify target texts to highlight
            targets = []
            if extracted_data.get('cml_number'):
                targets.extend(extracted_data['cml_number'].split('-'))
            if extracted_data.get('is_standard'):
                targets.append(extracted_data['is_standard'].split(' ')[-1])
            targets.append('ISI')
            
            found_annotation = False
            
            n_boxes = len(ocr_data['text'])
            for i in range(n_boxes):
                word = ocr_data['text'][i].strip()
                if len(word) < 3:
                    continue
                # If word matches any of our targets
                if any(t.lower() in word.lower() for t in targets):
                    (x, y, w, h) = (ocr_data['left'][i], ocr_data['top'][i], ocr_data['width'][i], ocr_data['height'][i])
                    # Draw neon box
                    draw.rectangle(((x, y), (x + w, y + h)), outline="#00FFFF", width=4)
                    draw.text((x, y - 15), word, fill="#00FFFF")
                    found_annotation = True
            
            # Export annotated image to base64
            buffered = io.BytesIO()
            image.save(buffered, format="JPEG")
            annotated_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
            
            extracted_data['annotated_image'] = f"data:image/jpeg;base64,{annotated_base64}"
            extracted_data['detection_source'] = "Vision Model + OCR" if found_annotation else "Vision Model (Coords unavailable)"
            extracted_data['confidence'] = 98 if found_annotation else 85
            
        except Exception as annotation_err:
            print(f"Annotation failed: {annotation_err}")
            extracted_data['annotated_image'] = f"data:{mime_type};base64,{base64_image}" # fallback to original
            extracted_data['detection_source'] = "Vision Model"
            extracted_data['confidence'] = 80

        return extracted_data
    except Exception as e:
        print(f"Groq API error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process image with AI")

class ComplaintRequest(BaseModel):
    subject: str
    details: str
    evidence_urls: list[str] = []
    
@app.post("/api/complaint/generate")
def generate_complaint_report(req: ComplaintRequest):
    if not req.subject or not req.details:
        raise HTTPException(status_code=400, detail="Subject and details are required.")
    
    # Generate a formatted complaint text
    report_text = f"""--- BIS COMPLAINT DRAFT ---
Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC
Subject: {req.subject.strip()}

Details:
{req.details.strip()}

Evidence Provided:
"""
    if req.evidence_urls:
        for idx, url in enumerate(req.evidence_urls, 1):
            report_text += f"{idx}. {url}\n"
    else:
        report_text += "None attached.\n"
        
    report_text += "\n---------------------------\n"
    report_text += "This is an automatically formatted draft. Please review and submit via the BIS Care App or official portal."
    
    return {
        "status": "success",
        "draft_report": report_text,
        "official_submission_url": "https://www.bis.gov.in/index.php/consumer-overview/complaints/"
    }

@app.get("/api/standards")
def get_standards(page: int = 1, limit: int = 20, search: str = "", category: str = ""):
    if not standards_data:
        return {"data": [], "total": 0, "page": page, "limit": limit}
    
    filtered = standards_data
    if search:
        search_lower = search.lower()
        filtered = [s for s in filtered if search_lower in s.get("standard_number", "").lower() or search_lower in s.get("full_title", "").lower()]
    
    if category:
        cat_lower = category.lower()
        filtered = [s for s in filtered if cat_lower in s.get("product_category", "").lower()]
        
    total = len(filtered)
    start = (page - 1) * limit
    end = start + limit
    paginated = filtered[start:end]
    
    # Extract unique categories for frontend filters
    categories = list(set([s.get("product_category", "Uncategorized") for s in standards_data if s.get("product_category")]))
    
    return {
        "data": paginated,
        "total": total,
        "page": page,
        "limit": limit,
        "categories": sorted(categories)
    }

