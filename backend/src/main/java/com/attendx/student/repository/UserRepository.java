package com.attendx.student.repository;

import com.attendx.student.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByRegNo(String regNo);
    Optional<User> findByEmail(String email);
    Boolean existsByRegNo(String regNo);
    Boolean existsByEmail(String email);
}
