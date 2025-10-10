package com.biovault;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000") // Allow frontend
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(request.getName(), request.getEmail(), request.getUsername(), request.getPasswordHash());
            return ResponseEntity.ok(new RegisterResponse(true, user.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new RegisterResponse(false, null));
        }
    }

    // NEW ENDPOINT FOR UNLOCKING THE VAULT
    @PostMapping("/auth/unlock")
    public ResponseEntity<?> unlock(@RequestBody UnlockRequest request) {
        try {
            // The frontend sends a hardcoded "demo-user", we will use that for now.
            // In the future, you'd get this from a JWT token or the request.
            User user = userService.unlockUser("demo-user"); 

            if (user != null) {
                // User found, return success
                // The confidence score is mocked for now
                return ResponseEntity.ok(new UnlockResponse(true, 0.96, "token_" + System.currentTimeMillis()));
            } else {
                // User not found, return failure
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
        // getters and setters...
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
        public RegisterResponse(boolean success, Long userId) {
            this.success = success;
            this.userId = userId;
        }
        public boolean isSuccess() { return success; }
        public Long getUserId() { return userId; }
    }

    // DTO for the unlock request
    public static class UnlockRequest {
        private String userId;
        private String method;
        private String proof;
        // getters and setters...
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }
        public String getProof() { return proof; }
        public void setProof(String proof) { this.proof = proof; }
    }

    // DTO for the unlock response
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