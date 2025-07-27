
🧠 🔐 BioVault – A Biometric-Based Password Vault with VPN Integration
👁️‍🗨️ Overview
BioVault is a secure desktop password manager that:

Authenticates users using face and voice recognition

Unlocks the vault only when connected to a secure VPN

Uses AES encryption for vault safety

Developed using Java (JavaFX) and Python (Flask)

future scopes(auto suggestions)

---
📂 Project Folder Structure

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


🔁 Biometric + VPN Workflow
1-> JavaFX GUI takes webcam and mic input.

2-> Sends input to Python Flask server (/verify) using HttpClient.

3-> Python verifies face and voice match.

4-> On success, Java triggers VPN connection (e.g., using ProcessBuilder or embedded VPN library).

5-> Once VPN is live, Java decrypts AES vault and unlocks UI.


🔐 Tech Stack

| Layer             | Technology                              |
| ----------------- | --------------------------------------- |
| Frontend GUI      | JavaFX + FXML                           |
| Vault DB          | SQLite + JDBC                           |
| Encryption        | AES (javax.crypto)                      |
| VPN Integration   | Java Networking / VPN client            |
| API Bridge        | Java HTTPClient + Python Flask          |
| Face Auth         | `face_recognition` (Python)             |
| Voice Auth        | `speechbrain` or `Resemblyzer` (Python) |
| Audio/Image Tools | OpenCV, NumPy, soundfile                |


🔐 Future Ideas
Auto suggestion to access passwords while login promts
Auto-lock vault on network disconnect

OTP fallback if biometrics fail

Vault activity log with timestamps

2FA integration (TOTP or Email-based)


## 📜 License

MIT License.
