from flask import Flask, request, jsonify
import os
import base64
from face_module import enroll_face, verify_face

app = Flask(__name__)

# Ensure the directory for known faces exists
if not os.path.exists("data/known_faces"):
    os.makedirs("data/known_faces")

@app.route("/enroll", methods=["POST"])
def enroll():
    data = request.get_json()
    if not data or "username" not in data or "faceEmbedding" not in data:
        return jsonify({"status": "error", "message": "Missing username or faceEmbedding"}), 400

    username = data["username"]
    image_data = base64.b64decode(data["faceEmbedding"])
    
    # Define the path to save the image
    image_path = f"data/known_faces/{username}.jpg"
    
    try:
        # Write the image data to a file
        with open(image_path, "wb") as f:
            f.write(image_data)
        
        # Enroll the face from the saved image file
        enroll_face(image_path, username)
        return jsonify({"status": "success", "message": f"User {username} enrolled successfully."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/verify", methods=["POST"])
def verify():
    data = request.get_json()
    if not data or "username" not in data or "faceEmbedding" not in data:
        return jsonify({"status": "error", "message": "Missing username or faceEmbedding"}), 400

    username = data["username"]
    image_data = base64.b64decode(data["faceEmbedding"])
    
    # Define a temporary path for the verification image
    verify_image_path = "data/verify_temp.jpg"
    
    try:
        with open(verify_image_path, "wb") as f:
            f.write(image_data)
        
        # Verify the face
        result = verify_face(verify_image_path, username)
        
        # Clean up the temporary image
        if os.path.exists(verify_image_path):
            os.remove(verify_image_path)
            
        if result:
            return jsonify({"status": "success", "message": "Face verified!"})
        else:
            return jsonify({"status": "fail", "message": "Face mismatch or not found."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)