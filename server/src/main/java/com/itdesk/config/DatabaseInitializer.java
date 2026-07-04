package com.itdesk.config;

import com.itdesk.entity.*;
import com.itdesk.repository.RoleRepository;
import com.itdesk.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(null, ERole.ROLE_ADMIN));
            roleRepository.save(new Role(null, ERole.ROLE_SUPPORT));
            roleRepository.save(new Role(null, ERole.ROLE_EMPLOYEE));
        }

        if (userRepository.count() == 0) {
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN).get();
            Role supportRole = roleRepository.findByName(ERole.ROLE_SUPPORT).get();
            Role employeeRole = roleRepository.findByName(ERole.ROLE_EMPLOYEE).get();

            String defaultPassword = passwordEncoder.encode("password123");

            User admin = User.builder()
                    .username("admin")
                    .email("admin@itdesk.com")
                    .password(defaultPassword)
                    .fullName("Ankur Sutradhar (Admin)")
                    .role(adminRole)
                    .department("IT Administration")
                    .phone("+1234567890")
                    .status("ACTIVE")
                    .build();
            userRepository.save(admin);

            User support1 = User.builder()
                    .username("support1")
                    .email("support1@itdesk.com")
                    .password(defaultPassword)
                    .fullName("Sarah Jenkins (Support L1)")
                    .role(supportRole)
                    .department("Global Application Support")
                    .phone("+1234567891")
                    .status("ACTIVE")
                    .build();
            userRepository.save(support1);

            User support2 = User.builder()
                    .username("support2")
                    .email("support2@itdesk.com")
                    .password(defaultPassword)
                    .fullName("David Miller (Network Ops)")
                    .role(supportRole)
                    .department("Network Engineering")
                    .phone("+1234567892")
                    .status("ACTIVE")
                    .build();
            userRepository.save(support2);

            User employee1 = User.builder()
                    .username("employee1")
                    .email("emp1@itdesk.com")
                    .password(defaultPassword)
                    .fullName("Alice Johnson (Developer)")
                    .role(employeeRole)
                    .department("Software Engineering")
                    .phone("+1234567893")
                    .status("ACTIVE")
                    .build();
            userRepository.save(employee1);

            User employee2 = User.builder()
                    .username("employee2")
                    .email("emp2@itdesk.com")
                    .password(defaultPassword)
                    .fullName("Bob Smith (Finance)")
                    .role(employeeRole)
                    .department("Finance & Accounting")
                    .phone("+1234567894")
                    .status("ACTIVE")
                    .build();
            userRepository.save(employee2);
        }
    }
}
