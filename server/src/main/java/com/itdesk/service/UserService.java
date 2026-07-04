package com.itdesk.service;

import com.itdesk.dto.*;
import com.itdesk.entity.*;
import com.itdesk.exception.BadRequestException;
import com.itdesk.exception.ResourceNotFoundException;
import com.itdesk.repository.RoleRepository;
import com.itdesk.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuditLogService auditLogService;

    // In-memory store for password reset tokens: Token -> Email
    private final Map<String, String> resetTokens = new ConcurrentHashMap<>();

    @Transactional
    public User registerUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use!");
        }

        ERole roleName = ERole.ROLE_EMPLOYEE;
        if (request.getRole() != null) {
            try {
                roleName = ERole.valueOf(request.getRole());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role specified");
            }
        }

        Role userRole = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("User Role not set."));

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .department(request.getDepartment())
                .role(userRole)
                .status("ACTIVE")
                .build();

        User savedUser = userRepository.save(user);
        auditLogService.log(savedUser, "REGISTER", "User registered successfully with role: " + roleName, "127.0.0.1");
        return savedUser;
    }

    @Transactional
    public User updateProfile(Long userId, ProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setDepartment(request.getDepartment());

        User updatedUser = userRepository.save(user);
        auditLogService.log(updatedUser, "UPDATE_PROFILE", "User updated profile information", "127.0.0.1");
        return updatedUser;
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Old password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(java.time.LocalDateTime.now());
        userRepository.save(user);
        auditLogService.log(user, "CHANGE_PASSWORD", "User changed password", "127.0.0.1");
    }

    public void initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email: " + email));

        String token = UUID.randomUUID().toString();
        resetTokens.put(token, email);

        // Send email
        emailService.sendPasswordResetEmail(email, token);
        auditLogService.log(user, "PASSWORD_RESET_REQUEST", "Password reset requested for email: " + email, "127.0.0.1");
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        String email = resetTokens.get(token);
        if (email == null) {
            throw new BadRequestException("Invalid or expired password reset token");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        resetTokens.remove(token);

        auditLogService.log(user, "PASSWORD_RESET_SUCCESS", "Password reset successfully using token", "127.0.0.1");
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getSupportEngineers() {
        return userRepository.findByRoleName(ERole.ROLE_SUPPORT);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
        auditLogService.log(null, "DELETE_USER", "User deleted ID: " + userId + ", username: " + user.getUsername(), "127.0.0.1");
    }

    @Transactional
    public User updateUserRole(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ERole eRole;
        try {
            eRole = ERole.valueOf(roleName);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + roleName);
        }

        Role role = roleRepository.findByName(eRole)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        user.setRole(role);
        User updated = userRepository.save(user);
        auditLogService.log(updated, "ROLE_CHANGE", "User role changed to: " + roleName, "127.0.0.1");
        return updated;
    }
}
