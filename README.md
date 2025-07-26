
# 🔐 BioVault – A Biometric-Based Password Manager

**BioVault** is a secure desktop password manager that uses **face and voice recognition** as the sole authentication mechanism, replacing traditional passwords.

## 🚀 Features

- 🔐 Securely store and manage passwords
- 🧠 Biometric authentication using **Face** and **Voice**
- 🧊 AES-encrypted vault storage
- 🧬 Hybrid architecture: Java for frontend/backend, Python for biometric processing
- 📦 Auto-suggest passwords on login (future scope)

---

## 🏗️ Architecture Overview

| Layer              | Technology Used                         |
|-------------------|------------------------------------------|
| GUI + Vault        | Java (JavaFX, SQLite, AES)               |
| Biometric Auth     | Python (Flask, face_recognition, Resemblyzer/speechbrain) |
| Communication      | REST API (Java ↔ Python via HTTP)        |

---

## 🛠️ Tech Stack

### Java
- JavaFX (UI)
- SQLite via JDBC (Vault DB)
- AES encryption (javax.crypto)
- HTTP Client (Java 11+)

### Python
- Flask (API server)
- `face_recognition` (Face match)
- `Resemblyzer` or `speechbrain` (Voiceprint match)
- OpenCV, NumPy, soundfile (Preprocessing)

---

## 🔁 Biometric Workflow

1. Java GUI captures webcam and mic input.
2. Sends it to Python Flask server over HTTP.
3. Python validates face + voice match.
4. If match, server returns `success` → Java unlocks vault.
5. If mismatch, access is denied.

---

## 📁 Folder Structure

```
BioVault/
│
├── java-app/                    # JavaFX GUI + vault logic
│   ├── src/
│   ├── vault/
│   └── utils/
│
├── biometric-auth-server/      # Python Flask server
│   ├── app.py
│   ├── face_module.py
│   ├── voice_module.py
│   └── utils/
│
└── README.md
```

---

## 🧪 Sample API (Python Flask)

**Endpoint:** `POST /verify`

**Request JSON:**
```json
{
  "face_image_base64": "<encoded_face_image>",
  "voice_clip_base64": "<encoded_voice_clip>"
}
```

**Response:**
```json
{
  "face_match": true,
  "voice_match": true
}
```

---

## 📜 License

MIT License.
