package com.biovault;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(request.getName(), request.getEmail(), request.getUsername(), request.getPasswordHash());
            return ResponseEntity.ok(new RegisterResponse(true, user.getId(), "Registration successful!"));
        } catch (IllegalStateException e) {
            // *** THIS IS THE KEY CHANGE ***
            // Catch the specific error and return a 409 Conflict status with the message
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new RegisterResponse(false, null, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new RegisterResponse(false, null, "An unexpected error occurred."));
        }
    }

    // ... (login and unlock methods remain the same)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.loginUser(request.getUsername(), request.getPasswordHash());
            if (user != null) {
                return ResponseEntity.ok(new LoginResponse(true, user.getId(), user.getUsername(), "token_" + System.currentTimeMillis()));
            } else {
                return ResponseEntity.status(401).body(new LoginResponse(false, null, null, null));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new LoginResponse(false, null, null, null));
        }
    }

    @PostMapping("/auth/unlock")
    public ResponseEntity<?> unlock(@RequestBody UnlockRequest request) {
        try {
            User user = userService.unlockUser(request.getUsername());
            if (user != null) {
                return ResponseEntity.ok(new UnlockResponse(true, 0.96, "token_" + System.currentTimeMillis()));
            } else {
                return ResponseEntity.status(401).body(new UnlockResponse(false, 0.0, null));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new UnlockResponse(false, 0.0, null));
        }
    }


    // Inner classes for Request/Response bodies

    public static class RegisterRequest {
        private String name;
        private String email;
        private String username;
        private String passwordHash;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPasswordHash() { return passwordHash; }
        public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    }

    public static class RegisterResponse {
        private boolean success;
        private Long userId;
        private String message;
        public RegisterResponse(boolean success, Long userId, String message) {
            this.success = success;
            this.userId = userId;
            this.message = message;
        }
        public boolean isSuccess() { return success; }
        public Long getUserId() { return userId; }
        public String getMessage() { return message; }
    }

    public static class LoginRequest {
        private String username;
        private String passwordHash;
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPasswordHash() { return passwordHash; }
        public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    }

    public static class LoginResponse {
        private boolean success;
        private Long userId;
        private String username;
        private String token;
        public LoginResponse(boolean success, Long userId, String username, String token) {
            this.success = success;
            this.userId = userId;
            this.username = username;
            this.token = token;
        }
        public boolean isSuccess() { return success; }
        public Long getUserId() { return userId; }
        public String getUsername() { return username; }
        public String getToken() { return token; }
    }
    
    public static class UnlockRequest {
        private String username;
        private String method;
        private String proof;
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }
        public String getProof() { return proof; }
        public void setProof(String proof) { this.proof = proof; }
    }

    public static class UnlockResponse {
        private boolean success;
        private double confidence;
        private String token;
        public UnlockResponse(boolean success, double confidence, String token) {
            this.success = success;
            this.confidence = confidence;
            this.token = token;
        }
        public boolean isSuccess() { return success; }
        public double getConfidence() { return confidence; }
        public String getToken() { return token; }
    }
}