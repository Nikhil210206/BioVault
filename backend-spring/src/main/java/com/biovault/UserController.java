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

    public static class RegisterRequest {
        private String name;
        private String email;
        private String username;
        private String passwordHash;

        // getters and setters

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
}
