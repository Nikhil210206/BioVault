# 🧠🔐 BioVault

A Biometric-Based Password Vault with VPN Integration

---

## 👁️‍🗨️ Overview

**BioVault** is a secure desktop password manager that:

- Authenticates users using **face and voice recognition**
- Unlocks the vault **only when connected to a secure VPN**
- Uses **AES encryption** for vault safety
- Developed using **Java (JavaFX)** and **Python (Flask)**

---

## 🚀 Features

- Biometric authentication (face + voice)
- VPN connection required to unlock vault
- AES-encrypted password storage
- Cross-language: JavaFX GUI, Python Flask backend
- Modular design for easy extension

---

## 📂 Project Structure

```text
BioVault/
├── java-app/                    # JavaFX GUI + Vault + VPN logic
│   ├── src/                     # Java source files
│   ├── vault/                   # Vault management (AES encryption, DB)
│   └── utils/                   # Java helper utilities
│
├── biometric-auth-server/      # Python Flask server for biometrics
│   ├── app.py                   # Main Flask app
│   ├── face_module.py           # Face recognition logic
│   ├── voice_module.py          # Voice recognition logic
│   └── utils/                   # Preprocessing (OpenCV, audio)
│
├── vpn/                         # (Optional) Java VPN logic
│   ├── vpnClient.java           # VPN client code
│   └── vpnUtils.java            # VPN helper functions
│
└── README.md                    # Project documentation
```

---

## 🔁 Biometric + VPN Workflow

1. JavaFX GUI takes webcam and mic input.
2. Sends input to Python Flask server (`/verify`) using `HttpClient`.
3. Python verifies face and voice match.
4. On success, Java triggers VPN connection (e.g., using `ProcessBuilder` or embedded VPN library).
5. Once VPN is live, Java decrypts AES vault and unlocks UI.

---

## 🛠️ Tech Stack

| Layer             | Technology                              |
| ----------------- | --------------------------------------- |
| Frontend GUI      | JavaFX + FXML                           |
| Vault DB          | SQLite + JDBC                           |
| Encryption        | AES (`javax.crypto`)                    |
| VPN Integration   | Java Networking / VPN client            |
| API Bridge        | Java HTTPClient + Python Flask          |
| Face Auth         | `face_recognition` (Python)             |
| Voice Auth        | `speechbrain` or `Resemblyzer` (Python) |
| Audio/Image Tools | OpenCV, NumPy, soundfile                |


---

## 🚀 Usage

- Launch the JavaFX application.
- Ensure the Python Flask server is running for biometric verification.
- Connect to a VPN (if not handled automatically).
- Use the GUI to manage your passwords securely.

---

## 📜 License

MIT License. See [LICENSE](LICENSE) for details.
