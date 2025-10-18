# OTP Authentication Implementation TODO

## Backend Changes
- [x] Create otp_script.py: Python script to generate 6-digit OTP, connect to PostgreSQL DB, update user with OTP and expiry (5 min), send email via SMTP.
- [x] Modify User.java: Replace passwordHash with otp (String) and otpExpiry (Timestamp).
- [x] Modify UserController.java: Update RegisterRequest to remove passwordHash, add RequestOtpRequest {email}, modify LoginRequest {email, otp}, add /request-otp endpoint that calls Python script.
- [x] Modify UserService.java: Update registerUser to not set passwordHash, update loginUser to find by email, check OTP and expiry.
- [x] Update UserRepository.java: Ensure findByEmail exists.

## Frontend Changes
- [x] Update Login.tsx: Replace username/password with email/OTP fields, add "Request OTP" button.
- [x] Update Register.tsx: Remove password field.
- [x] Update apiClient.js: Modify registerUser to not send passwordHash, modify loginUser to send email and otp, add requestOtp function.

## Testing
- [ ] Run backend and frontend, test registration without password.
- [ ] Test login: Enter email, request OTP, check email, enter OTP, login success.
- [ ] Verify OTP expiry (simulate time pass or check logic).
