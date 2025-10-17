import json
import os
from cryptography.fernet import Fernet
from pymongo import MongoClient

# --- UPDATE YOUR MONGODB CREDENTIALS HERE ---
MONGO_USERNAME = "your_mongo_user"  # Replace with your MongoDB username
MONGO_PASSWORD = "your_mongo_password"  # Replace with your MongoDB password
MONGO_HOST = "localhost"
MONGO_PORT = 27017
MONGO_DB_NAME = "biovault"
# -----------------------------------------

# Construct the connection string
MONGO_URI = f"mongodb://{MONGO_USERNAME}:{MONGO_PASSWORD}@{MONGO_HOST}:{MONGO_PORT}/"

# MongoDB connection
try:
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB_NAME]
    collection = db['embeddings']
    # The ismaster command is cheap and does not require auth.
    client.admin.command('ismaster')
    print("MongoDB connection successful.")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    # Fallback to a local, unauthenticated connection for development
    client = MongoClient('mongodb://localhost:27017/')
    db = client['biovault']
    collection = db['embeddings']


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
    """Save face embedding securely in MongoDB"""
    # Encrypt the encoding
    encrypted_encoding = cipher.encrypt(json.dumps(encoding).encode())
    # Store in MongoDB
    collection.update_one(
        {'username': username},
        {'$set': {'username': username, 'encoding': encrypted_encoding}},
        upsert=True
    )

def load_embeddings():
    """Load all embeddings from MongoDB"""
    embeddings = {}
    for doc in collection.find():
        username = doc['username']
        encrypted_encoding = doc['encoding']
        # Decrypt the encoding
        decrypted_encoding = json.loads(cipher.decrypt(encrypted_encoding).decode())
        embeddings[username] = decrypted_encoding
    return embeddings