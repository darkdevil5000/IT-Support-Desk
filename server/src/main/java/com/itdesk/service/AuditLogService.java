package com.itdesk.service;

import com.itdesk.entity.AuditLog;
import com.itdesk.entity.User;
import com.itdesk.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Transactional
    public void log(User user, String action, String details, String ipAddress) {
        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action(action)
                .details(details)
                .ipAddress(ipAddress)
                .build();
        auditLogRepository.save(auditLog);
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<AuditLog> getFilteredLogs(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate) {
        List<AuditLog> logs = auditLogRepository.findAllByOrderByCreatedAtDesc();
        if (startDate != null && endDate != null) {
            return logs.stream()
                    .filter(l -> !l.getCreatedAt().isBefore(startDate) && !l.getCreatedAt().isAfter(endDate))
                    .collect(java.util.stream.Collectors.toList());
        } else if (startDate != null) {
            return logs.stream()
                    .filter(l -> !l.getCreatedAt().isBefore(startDate))
                    .collect(java.util.stream.Collectors.toList());
        } else if (endDate != null) {
            return logs.stream()
                    .filter(l -> !l.getCreatedAt().isAfter(endDate))
                    .collect(java.util.stream.Collectors.toList());
        }
        return logs;
    }
}
