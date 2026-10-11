import json

with open('backend/bis_dataset/dataset/real_bis_standards.json') as f:
    data = json.load(f)
standards_data = data if isinstance(data, list) else data.get('standards', data)
texts = [f"{s.get('standard_number', '')} {s.get('full_title', '')} {s.get('product_category', '')}" for s in standards_data]
print(texts[0])
