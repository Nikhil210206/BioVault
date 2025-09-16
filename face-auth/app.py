from flask import Flask, request, jsonify
from face_module import enroll_face, verify_face
from utils.camera import capture_image

app = Flask(__name__)

@app.route("/enroll", methods=["POST"])
def enroll():
    username = request.form.get("username")
    image_path = capture_image(f"known_faces/{username}.jpg")
    try:
        enroll_face(image_path, username)
        return jsonify({"status": "success", "message": f"User {username} enrolled successfully."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route("/verify", methods=["POST"])
def verify():
    username = request.form.get("username")
    image_path = capture_image("verify.jpg")
    result = verify_face(image_path, username)
    if result:
        return jsonify({"status": "success", "message": "Face verified!"})
    else:
        return jsonify({"status": "fail", "message": "Face mismatch or not found."})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
