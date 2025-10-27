package com.biovault.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.biovault.User;

import repository.UserRepository;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Injected for security

    /**
     * Registers a new user after checking for duplicates and securely hashing the password.
     * @param name The user's full name.
     * @param email The user's email (must be unique).
     * @param username The user's username (must be unique).
     * @param plainTextPassword The user's plain-text password.
     * @return The saved User object.
     * @throws IllegalStateException if the username or email is already taken.
     */
    public User registerUser(String name, String email, String username, String plainTextPassword) {
        // Check if username exists using Optional's isPresent() method
        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalStateException("Username '" + username + "' is already taken.");
        }
        // Check if email exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalStateException("Email '" + email + "' is already registered.");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setUsername(username);
        
        // --- SECURITY FIX ---
        // Hash the password here on the backend, never trust a frontend-generated hash.
        user.setPasswordHash(passwordEncoder.encode(plainTextPassword));
        
        return userRepository.save(user);
    }

    /**
     * Authenticates a user by comparing the provided plain-text password with the stored hash.
     * @param username The user's username.
     * @param plainTextPassword The plain-text password to check.
     * @return The User object if authentication is successful, otherwise null.
     */
    public User loginUser(String username, String plainTextPassword) {
        Optional<User> userOptional = userRepository.findByUsername(username);

        // Check if user exists and if the provided password matches the stored hash.
        if (userOptional.isPresent() && passwordEncoder.matches(plainTextPassword, userOptional.get().getPasswordHash())) {
            return userOptional.get();
        }
        
        return null; // Authentication failed
    }

    /**
     * Finds a user by their username.
     * @param username The username to search for.
     * @return An Optional containing the User if found.
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Sets the Azure Voice Profile ID for a given user.
     * @param username The user to update.
     * @param voiceProfileId The new voice profile ID from Azure.
     * @throws IllegalStateException if the user is not found.
     */
    public void setVoiceProfileIdForUser(String username, String voiceProfileId) {
        // Find the user, or throw an exception if they don't exist.
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("User not found: " + username));
        
        user.setVoiceProfileId(voiceProfileId);
        userRepository.save(user); // Save the updated user information
    }
}
