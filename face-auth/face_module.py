import face_recognition
import numpy as np
from utils import storage

# Load embeddings from storage
known_faces = storage.load_embeddings()

def enroll_face(image_path, username):
    """Enroll a new face and save encoding"""
    image = face_recognition.load_image_file(image_path)
    encodings = face_recognition.face_encodings(image)
    if len(encodings) == 0:
        raise ValueError("No face found in the image!")
    
    encoding = encodings[0]
    storage.save_embedding(username, encoding.tolist())
    return True

def verify_face(image_path, username, tolerance=0.5):
    """Verify a face against stored embeddings"""
    image = face_recognition.load_image_file(image_path)
    encodings = face_recognition.face_encodings(image)
    
    if len(encodings) == 0:
        return False
    
    input_encoding = encodings[0]
    stored_encoding = np.array(known_faces.get(username))

    results = face_recognition.compare_faces([stored_encoding], input_encoding, tolerance)
    return results[0]
