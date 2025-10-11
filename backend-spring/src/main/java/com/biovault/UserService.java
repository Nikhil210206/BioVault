package com.biovault;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(String name, String email, String username, String passwordHash) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setUsername(username);
        user.setPasswordHash(passwordHash);
        return userRepository.save(user);
    }

    /**
     * Authenticates a user by checking username and password hash.
     * @param username The username to check.
     * @param passwordHash The base64 encoded password hash to compare.
     * @return The User if credentials match, otherwise null.
     */
    public User loginUser(String username, String passwordHash) {
        System.out.println("--- Attempting login for user: " + username + " ---");
        
        // Find the user by their username
        User user = userRepository.findByUsername(username);

        // If user is not found, exit early
        if (user == null) {
            System.out.println("Login failed: User not found.");
            return null;
        }

        // Add logging to see what's being compared
        System.out.println("Password hash from login attempt: " + passwordHash);
        System.out.println("Password hash stored in database: " + user.getPasswordHash());

        // *** THIS IS THE FIX ***
        // Use Objects.equals() to safely compare, preventing crashes if the stored hash is null.
        if (Objects.equals(user.getPasswordHash(), passwordHash)) {
            System.out.println("Login successful!");
            return user;
        }

        System.out.println("Login failed: Password hashes do not match.");
        return null;
    }

    /**
     * Authenticates a user for unlocking the vault.
     * @param username The username to check.
     * @return The User if found, otherwise null.
     */
    public User unlockUser(String username) {
        return userRepository.findByUsername(username);
    }
}