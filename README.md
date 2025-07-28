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

## 💡 Future Ideas

- Auto-suggestion to access passwords while on login prompts
- Auto-lock vault on network disconnect
- OTP fallback if biometrics fail
- Vault activity log with timestamps
- 2FA integration (TOTP or Email-based)

---

## 📦 Installation

> **Note:** Detailed setup instructions coming soon!

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/BioVault.git
   cd BioVault
   ```
2. Follow setup instructions in `java-app/` and `biometric-auth-server/` folders.

---

## 🚀 Usage

- Launch the JavaFX application.
- Ensure the Python Flask server is running for biometric verification.
- Connect to a VPN (if not handled automatically).
- Use the GUI to manage your passwords securely.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

MIT License. See [LICENSE](LICENSE) for details.
