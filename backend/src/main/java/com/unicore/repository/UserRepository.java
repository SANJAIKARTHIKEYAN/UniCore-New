package com.unicore.repository;

import com.unicore.entity.Role;
import com.unicore.entity.User;
import com.unicore.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    long countByRole(Role role);
    long countByStatus(UserStatus status);
    List<User> findByRoleAndStatus(Role role, UserStatus status);
}

