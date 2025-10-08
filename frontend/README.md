# BioVault - Biometric Password Manager

![BioVault](https://img.shields.io/badge/BioVault-v1.0-blue) ![React](https://img.shields.io/badge/React-18.3-61dafb) ![Framer Motion](https://img.shields.io/badge/Framer%20Motion-Animations-ff0055) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6)

**BioVault** is a modern, security-first password vault that uses biometric authentication (face and voice recognition) to provide passwordless access to your sensitive data. Built with React, TypeScript, Tailwind CSS, and Framer Motion for smooth, accessible animations.

## 🚀 Features

- **Biometric Authentication**: Face recognition and voice authentication
- **AES-256 Encryption**: Military-grade encryption for all stored data
- **Local-First Architecture**: Process biometrics on your device
- **Password Generator**: Create cryptographically secure passwords
- **Import/Export**: Backup and restore your encrypted vault data
- **Accessibility**: Full keyboard navigation and `prefers-reduced-motion` support
- **Dark Mode**: Beautiful dark mode with glassmorphism UI
- **Privacy-First**: Only encrypted embeddings stored by default

## 📋 Table of Contents

- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Testing Reduced Motion](#testing-reduced-motion)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [API Documentation](#api-documentation)
- [Security & Privacy](#security--privacy)
- [Development](#development)
- [License](#license)

## 🛠️ Installation

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with camera and microphone access

### Steps

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd biovault
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:8080
```

## 🏃 Running the Project

### Development Mode
```bash
npm run dev
```
Runs the app in development mode with hot reloading at `http://localhost:8080`

### Build for Production
```bash
npm run build
```
Creates an optimized production build in the `dist/` folder

### Preview Production Build
```bash
npm run preview
```
Preview the production build locally

### Lint Code
```bash
npm run lint
```
Run ESLint to check code quality

## ♿ Testing Reduced Motion

BioVault respects the `prefers-reduced-motion` accessibility setting. To test this:

### On macOS:
1. Open **System Preferences** → **Accessibility** → **Display**
2. Check **"Reduce motion"**

### On Windows:
1. Open **Settings** → **Ease of Access** → **Display**
2. Turn on **"Show animations in Windows"** (OFF to reduce motion)

### In Browser DevTools:
**Chrome/Edge:**
1. Open DevTools (F12)
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
3. Type "Emulate CSS prefers-reduced-motion"
4. Select "prefers-reduced-motion: reduce"

**Firefox:**
1. Open DevTools (F12)
2. Click **Settings (gear icon)** → **Inspector**
3. Check **"Enable prefers-reduced-motion simulation"**

When reduced motion is enabled:
- Infinite animations (floating, pulsing) are disabled
- Complex transitions become simple fades
- Animation durations are minimized
- Page remains fully functional with reduced visual motion

## 📁 Project Structure

```
biovault/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.tsx       # Site-wide navigation header
│   │   ├── Footer.tsx       # Site-wide footer
│   │   ├── Modal.tsx        # Accessible modal component
│   │   ├── Toast.tsx        # Toast notifications
│   │   ├── EnrollFace.tsx   # Face biometric enrollment
│   │   └── EnrollVoice.tsx  # Voice biometric enrollment
│   │
│   ├── pages/               # Page components
│   │   ├── Index.tsx        # Landing page
│   │   ├── Landing.tsx      # Hero and features
│   │   ├── Register.tsx     # User registration flow
│   │   ├── Unlock.tsx       # Vault unlock page
│   │   ├── Tools.tsx        # Password generator & import/export
│   │   ├── Settings.tsx     # User settings & preferences
│   │   └── HowItWorks.tsx   # Technical documentation
│   │
│   ├── lib/                 # Core libraries
│   │   ├── motionSystem.js  # Framer Motion variants & accessibility
│   │   ├── apiClient.js     # API client with mock endpoints
│   │   └── utils.ts         # Utility functions
│   │
│   ├── components/ui/       # shadcn UI components
│   ├── App.tsx              # Main app component & routing
│   ├── index.css            # Global styles & design system
│   └── main.tsx             # App entry point
│
├── public/                  # Static assets
├── docs/                    # Documentation
│   ├── API.md              # API documentation
│   ├── security-privacy.txt # Security & privacy notes
│   └── accessibility-checklist.txt
│
├── design/                  # Design assets (mockups, SVGs)
├── index.html              # HTML entry point
├── tailwind.config.ts      # Tailwind CSS configuration
├── vite.config.ts          # Vite build configuration
└── README.md               # This file
```

## 🔧 Technologies Used

- **React 18.3** - UI framework with functional components
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library with accessibility support
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing
- **shadcn/ui** - Accessible component library

## 📡 API Documentation

### Base URL
```
/api
```

### Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "passwordHash": "optional-base64-hash"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "user_1234567890",
  "message": "User registered successfully"
}
```

#### Enroll Face Biometric
```http
POST /api/biometrics/face/enroll
Content-Type: application/json

{
  "userId": "user_1234567890",
  "faceEmbedding": "base64-encoded-embedding",
  "metadata": {
    "device": "Chrome on MacOS",
    "timestamp": "2025-01-15T10:30:00Z",
    "captureMethod": "webcam"
  }
}
```

**Response:**
```json
{
  "success": true,
  "enrollmentId": "face_1234567890",
  "confidence": 0.98,
  "message": "Face biometric enrolled successfully"
}
```

#### Enroll Voice Biometric
```http
POST /api/biometrics/audio/enroll
Content-Type: application/json

{
  "userId": "user_1234567890",
  "audioEmbedding": "base64-encoded-embedding",
  "metadata": {
    "duration": 3.5,
    "transcript": "BioVault secures my passwords",
    "timestamp": "2025-01-15T10:35:00Z",
    "device": "Chrome on MacOS"
  }
}
```

**Response:**
```json
{
  "success": true,
  "enrollmentId": "voice_1234567890",
  "confidence": 0.95,
  "transcript": "BioVault secures my passwords",
  "message": "Voice biometric enrolled successfully"
}
```

#### Unlock Vault
```http
POST /api/auth/unlock
Content-Type: application/json

{
  "userId": "user_1234567890",
  "method": "face",
  "proof": "base64-encoded-proof",
  "otp": "optional-otp-code"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "token_1234567890",
  "confidence": 0.96,
  "message": "Vault unlocked successfully",
  "sessionId": "session_1234567890"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "confidence": 0.45,
  "message": "Biometric verification failed"
}
```

#### Get User Sessions
```http
GET /api/user/sessions?userId=user_1234567890
```

**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "sessionId": "session_001",
      "loginTime": "2025-01-15T09:00:00Z",
      "logoutTime": "2025-01-15T10:30:00Z",
      "method": "face",
      "device": "Chrome on MacOS"
    }
  ]
}
```

### Mock API Client

The current implementation uses a mock API client (`src/lib/apiClient.js`) with simulated network delays. To connect to a real backend:

1. Update `API_BASE_URL` in `src/lib/apiClient.js`
2. Remove mock delays and responses
3. Implement proper error handling
4. Add authentication token management

## 🔒 Security & Privacy

### What We Store (Default)
- ✅ **Encrypted biometric embeddings** (mathematical representations)
- ✅ **Enrollment timestamps** and device metadata
- ✅ **User account information** (encrypted)
- ✅ **Session logs** and authentication history

### What We DON'T Store (Default)
- ❌ Raw face images or photos
- ❌ Raw audio recordings or voice samples
- ❌ Unencrypted passwords or sensitive data
- ❌ Biometric data without explicit user consent

### Encryption
- **At Rest**: AES-256-GCM encryption
- **In Transit**: TLS 1.3
- **Key Derivation**: PBKDF2-SHA256

### Privacy Controls
Users can optionally enable "raw data storage" in settings, which requires explicit consent and stores original images/audio encrypted alongside embeddings.

### Biometric Processing
1. **Client-side processing**: Face alignment, cropping, and embedding extraction happen on the user's device
2. **No raw data transmission**: Only encrypted embeddings are sent to the server
3. **Secure deletion**: Users can permanently delete all biometric data at any time

For full security documentation, see [`docs/security-privacy.txt`](docs/security-privacy.txt)

## 🎨 Motion System

BioVault uses Framer Motion with a custom motion system (`src/lib/motionSystem.js`) that provides:

### Variants
- `fadeInUp` - Fade in with upward motion
- `modalSlide` - Slide animation for modals
- `floatLoop` - Infinite floating animation (disabled in reduced motion)
- `buttonTap` - Tap/press animation for buttons
- `shake` - Shake animation for errors
- `checkmarkDraw` - SVG path animation for success states
- `pulse` - Pulsing animation for recording indicators
- `waveformBar` - Animated bars for voice waveform

### Accessibility
All animations respect `prefers-reduced-motion`:
```javascript
import { useMotionSafe } from "@/lib/motionSystem";

const { shouldReduce } = useMotionSafe();

<motion.div
  {...(shouldReduce ? {} : animationVariant)}
>
```

## 🧪 Development

### Adding New Components

1. Create component in `src/components/` or `src/pages/`
2. Import motion variants from `src/lib/motionSystem.js`
3. Use `useMotionSafe()` hook to respect reduced motion
4. Add routing in `src/App.tsx` if needed

### Biometric SDK Integration

To integrate real biometric processing:

**Face Recognition:**
- Use libraries like `face-api.js` or `MediaPipe Face Mesh`
- Extract face embeddings on client-side
- Send only embeddings to server

**Voice Recognition:**
- Use Web Audio API for recording
- Process with voice recognition SDKs (e.g., `speaker-recognition`)
- Extract voice embeddings locally

See placeholder comments in `EnrollFace.tsx` and `EnrollVoice.tsx` for integration points.

### Testing

#### Unit Tests
```bash
npm run test
```

Suggested test files:
- `src/components/__tests__/EnrollFace.test.tsx`
- `src/components/__tests__/EnrollVoice.test.tsx`
- `src/lib/__tests__/apiClient.test.js`

#### E2E Tests
Use Playwright or Cypress to test full enrollment and unlock flows.

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📞 Support

- Documentation: [View full docs](https://docs.biovault.dev)
- Issues: [GitHub Issues](https://github.com/yourusername/biovault/issues)
- Email: support@biovault.dev

---

**Built with ❤️ using React, TypeScript, and Framer Motion**

*BioVault - Your biometric key to password peace* 🔐
