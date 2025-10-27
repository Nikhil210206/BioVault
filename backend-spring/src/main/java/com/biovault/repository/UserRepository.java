package com.biovault.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.biovault.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Using Optional<User> is a best practice to avoid NullPointerExceptions.
    // It makes it explicit in the code that a user might not exist for a given username or email.
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

}
