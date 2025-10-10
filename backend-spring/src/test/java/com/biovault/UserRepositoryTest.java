package com.biovault;

import com.biovault.User;
import com.biovault.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testCreateReadDeleteUser() {
        User user = new User();
        user.setUsername("testuser");
        user.setPasswordHash("testpass"); // Corrected method name

        // Create
        user = userRepository.save(user);
        assertThat(user.getId()).isNotNull();

        // Read
        Optional<User> found = userRepository.findById(user.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getUsername()).isEqualTo("testuser");

        // Delete
        userRepository.delete(user);
        Optional<User> deleted = userRepository.findById(user.getId());
        assertThat(deleted).isNotPresent();
    }
}