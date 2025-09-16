import json
import os
from cryptography.fernet import Fernet

DATA_FILE = "data/embeddings.json"
KEY_FILE = "data/secret.key"

def generate_key():
    key = Fernet.generate_key()
    with open(KEY_FILE, "wb") as key_file:
        key_file.write(key)

def load_key():
    return open(KEY_FILE, "rb").read()

if not os.path.exists(KEY_FILE):
    generate_key()

cipher = Fernet(load_key())

def save_embedding(username, encoding):
    """Save face embedding securely"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "rb") as f:
            encrypted_data = f.read()
            data = json.loads(cipher.decrypt(encrypted_data).decode())
    else:
        data = {}

    data[username] = encoding

    encrypted_data = cipher.encrypt(json.dumps(data).encode())
    with open(DATA_FILE, "wb") as f:
        f.write(encrypted_data)

def load_embeddings():
    """Load all embeddings"""
    if not os.path.exists(DATA_FILE):
        return {}
    with open(DATA_FILE, "rb") as f:
        encrypted_data = f.read()
        data = json.loads(cipher.decrypt(encrypted_data).decode())
    return data
