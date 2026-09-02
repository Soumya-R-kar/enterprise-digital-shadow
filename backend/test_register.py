import requests

url = "http://localhost:8000/api/auth/register"
data = {
    "username": "testuser123",
    "email": "test123@example.com",
    "password": "test123",
    "full_name": "Test User",
    "role": "engineer",
    "department": "IT"
}

print("Attempting to register user...")
response = requests.post(url, json=data)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 200:
    print("\n✅ SUCCESS! User registered.")
else:
    print("\n❌ FAILED! Check the error above.")