import json
import torch
from sentence_transformers import SentenceTransformer, util

with open('backend/bis_dataset/dataset/real_bis_standards.json') as f:
    data = json.load(f)
standards_data = data.get('standards', data)
texts = [f"{s.get('standard_number', '')} {s.get('full_title', '')} {s.get('product_category', '')}" for s in standards_data]
model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(texts, convert_to_tensor=True)

query = "IS 14543"
q_emb = model.encode(query, convert_to_tensor=True)
scores = util.cos_sim(q_emb, embeddings)[0]
top = torch.topk(scores, k=1)
print(f"Query: {query}, Max Score: {top.values[0].item()}, Match: {texts[top.indices[0].item()]}")

query = "WATER"
q_emb = model.encode(query, convert_to_tensor=True)
scores = util.cos_sim(q_emb, embeddings)[0]
top = torch.topk(scores, k=1)
print(f"Query: {query}, Max Score: {top.values[0].item()}, Match: {texts[top.indices[0].item()]}")
