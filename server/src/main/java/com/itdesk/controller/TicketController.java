package com.itdesk.controller;

import com.itdesk.dto.TicketRequest;
import com.itdesk.dto.TicketResponse;
import com.itdesk.entity.*;
import com.itdesk.exception.ResourceNotFoundException;
import com.itdesk.repository.UserRepository;
import com.itdesk.security.UserPrincipal;
import com.itdesk.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createTicket(@Valid @RequestBody TicketRequest request,
                                          @AuthenticationPrincipal UserPrincipal currentUser) {
        User creator = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Creator not found"));
        Ticket ticket = ticketService.createTicket(request, creator);
        return ResponseEntity.ok(TicketResponse.fromEntity(ticket));
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Ticket> tickets = ticketService.getFilteredTickets(status, priority, category, search, user);
        List<TicketResponse> responses = tickets.stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketDetails(@PathVariable Long id) {
        Ticket ticket = ticketService.getTicketDetails(id);
        return ResponseEntity.ok(TicketResponse.fromEntity(ticket));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTicket(@PathVariable Long id,
                                          @Valid @RequestBody TicketRequest request,
                                          @AuthenticationPrincipal UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Ticket ticket = ticketService.updateTicket(id, request, user);
        return ResponseEntity.ok(TicketResponse.fromEntity(ticket));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPPORT')")
    public ResponseEntity<?> assignTicket(@PathVariable Long id,
                                          @RequestBody Map<String, Long> request,
                                          @AuthenticationPrincipal UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Long assigneeId = request.get("assigneeId");
        Ticket ticket = ticketService.assignTicket(id, assigneeId, user);
        return ResponseEntity.ok(TicketResponse.fromEntity(ticket));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> changeTicketStatus(@PathVariable Long id,
                                                @RequestBody Map<String, String> request,
                                                @AuthenticationPrincipal UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        TicketStatus status = TicketStatus.valueOf(request.get("status").toUpperCase());
        Ticket ticket = ticketService.changeStatus(id, status, user);
        return ResponseEntity.ok(TicketResponse.fromEntity(ticket));
    }

    @PutMapping("/{id}/escalate")
    public ResponseEntity<?> escalateTicket(@PathVariable Long id,
                                            @AuthenticationPrincipal UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Ticket ticket = ticketService.escalateTicket(id, user);
        return ResponseEntity.ok(TicketResponse.fromEntity(ticket));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<TicketHistory>> getTicketHistory(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketHistory(id));
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<?> uploadAttachment(@PathVariable Long id,
                                              @RequestParam("file") MultipartFile file,
                                              @AuthenticationPrincipal UserPrincipal currentUser) throws IOException {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Attachment attachment = ticketService.uploadAttachment(id, file, user);
        return ResponseEntity.ok(attachment);
    }

    @GetMapping("/{id}/attachments")
    public ResponseEntity<List<Attachment>> getAttachments(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getAttachments(id));
    }

    @GetMapping("/attachments/{attachmentId}")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long attachmentId) throws MalformedURLException {
        Attachment attachment = ticketService.getAttachment(attachmentId);
        Path filePath = Paths.get("uploads").toAbsolutePath().resolve(attachment.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists()) {
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(attachment.getFileType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName() + "\"")
                    .body(resource);
        } else {
            throw new ResourceNotFoundException("File not found on storage");
        }
    }
}
