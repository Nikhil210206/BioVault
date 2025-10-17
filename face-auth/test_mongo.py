from pymongo import MongoClient
import os

# --- Use the same credentials as in your storage.py ---
MONGO_USERNAME = "your_mongo_user"
MONGO_PASSWORD = "your_mongo_password"
MONGO_HOST = "localhost"
MONGO_PORT = 27017
# ----------------------------------------------------

MONGO_URI = f"mongodb://{MONGO_USERNAME}:{MONGO_PASSWORD}@{MONGO_HOST}:{MONGO_PORT}/?authSource=admin"

try:
    # Establish a connection to MongoDB
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)

    # The ismaster command is cheap and does not require auth.
    client.admin.command('ismaster')
    
    print("✅ MongoDB connection successful!")

except Exception as e:
    print(f"❌ Failed to connect to MongoDB.")
    print(f"Error: {e}")

finally:
    # Close the connection
    if 'client' in locals() and client:
        client.close()