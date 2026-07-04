package com.itdesk.controller;

import com.itdesk.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPPORT')")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private com.itdesk.service.AuditLogService auditLogService;

    private java.time.LocalDateTime parseStartDateTime(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) return null;
        return java.time.LocalDate.parse(dateStr).atStartOfDay();
    }

    private java.time.LocalDateTime parseEndDateTime(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) return null;
        return java.time.LocalDate.parse(dateStr).atTime(java.time.LocalTime.MAX);
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getAuditLogs(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String startDate,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String endDate) {
        java.time.LocalDateTime start = parseStartDateTime(startDate);
        java.time.LocalDateTime end = parseEndDateTime(endDate);
        return ResponseEntity.ok(auditLogService.getFilteredLogs(start, end));
    }

    @GetMapping("/export/excel")
    public ResponseEntity<InputStreamResource> exportExcel(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String startDate,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String endDate) throws IOException {
        java.time.LocalDateTime start = parseStartDateTime(startDate);
        java.time.LocalDateTime end = parseEndDateTime(endDate);
        ByteArrayInputStream in = reportService.exportTicketsToExcel(start, end);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=tickets.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<InputStreamResource> exportPdf(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String startDate,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String endDate) {
        java.time.LocalDateTime start = parseStartDateTime(startDate);
        java.time.LocalDateTime end = parseEndDateTime(endDate);
        ByteArrayInputStream in = reportService.exportTicketsToPdf(start, end);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=tickets.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(in));
    }
}
