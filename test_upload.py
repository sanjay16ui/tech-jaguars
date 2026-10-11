import requests

url = 'http://127.0.0.1:8000/api/inspect-image'
files = {'file': open('test_label.png', 'rb')}
response = requests.post(url, files=files)
print(response.status_code)
print(response.text)
