package com.itdesk.service;

import com.itdesk.dto.TicketRequest;
import com.itdesk.entity.*;
import com.itdesk.exception.BadRequestException;
import com.itdesk.exception.ResourceNotFoundException;
import com.itdesk.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TicketHistoryRepository historyRepository;

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private EmailService emailService;

    private final Path fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

    public TicketService() {
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Transactional
    public Ticket createTicket(TicketRequest request, User creator) {
        TicketCategory category;
        TicketPriority priority;
        try {
            category = TicketCategory.valueOf(request.getCategory().toUpperCase());
            priority = TicketPriority.valueOf(request.getPriority().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid category or priority");
        }

        Ticket ticket = Ticket.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(category)
                .priority(priority)
                .status(TicketStatus.OPEN)
                .createdBy(creator)
                .build();

        if (request.getAssignedToId() != null) {
            User assignee = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
            ticket.setAssignedTo(assignee);
            ticket.setStatus(TicketStatus.ASSIGNED);
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        // Audit Log
        auditLogService.log(creator, "TICKET_CREATION", "Created ticket #" + savedTicket.getId() + " - " + savedTicket.getTitle(), "127.0.0.1");

        // History
        saveHistory(savedTicket, creator, "CREATION", "UNASSIGNED", savedTicket.getAssignedTo() != null ? savedTicket.getAssignedTo().getFullName() : "UNASSIGNED");

        // Notifications & Emails
        emailService.sendTicketCreatedEmail(creator.getEmail(), savedTicket.getId(), savedTicket.getTitle());
        if (savedTicket.getAssignedTo() != null) {
            notificationService.createNotification(savedTicket.getAssignedTo(), "A new ticket #" + savedTicket.getId() + " has been assigned to you.", savedTicket);
            emailService.sendTicketAssignedEmail(savedTicket.getAssignedTo().getEmail(), savedTicket.getId(), savedTicket.getTitle(), savedTicket.getAssignedTo().getFullName());
        }

        return savedTicket;
    }

    @Transactional
    public Ticket updateTicket(Long ticketId, TicketRequest request, User updater) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        // Validate access - Employees can only edit their own OPEN tickets
        boolean isAdmin = updater.getRole().getName() == ERole.ROLE_ADMIN;
        boolean isSupport = updater.getRole().getName() == ERole.ROLE_SUPPORT;
        if (!isAdmin && !isSupport && (!ticket.getCreatedBy().getId().equals(updater.getId()) || ticket.getStatus() != TicketStatus.OPEN)) {
            throw new BadRequestException("You are not authorized to edit this ticket.");
        }

        StringBuilder details = new StringBuilder("Updated: ");
        
        if (!ticket.getTitle().equals(request.getTitle())) {
            details.append("Title, ");
            ticket.setTitle(request.getTitle());
        }
        if (!ticket.getDescription().equals(request.getDescription())) {
            details.append("Description, ");
            ticket.setDescription(request.getDescription());
        }
        
        TicketCategory newCategory = TicketCategory.valueOf(request.getCategory().toUpperCase());
        if (ticket.getCategory() != newCategory) {
            details.append("Category (").append(ticket.getCategory()).append(" -> ").append(newCategory).append("), ");
            ticket.setCategory(newCategory);
        }

        TicketPriority newPriority = TicketPriority.valueOf(request.getPriority().toUpperCase());
        if (ticket.getPriority() != newPriority) {
            details.append("Priority (").append(ticket.getPriority()).append(" -> ").append(newPriority).append("), ");
            ticket.setPriority(newPriority);
        }

        if (request.getStatus() != null) {
            TicketStatus newStatus = TicketStatus.valueOf(request.getStatus().toUpperCase());
            if (ticket.getStatus() != newStatus) {
                changeStatusInternal(ticket, newStatus, updater);
            }
        }

        if (request.getAssignedToId() != null) {
            if (ticket.getAssignedTo() == null || !ticket.getAssignedTo().getId().equals(request.getAssignedToId())) {
                assignTicketInternal(ticket, request.getAssignedToId(), updater);
            }
        } else if (request.getAssignedToId() == null && ticket.getAssignedTo() != null && (isAdmin || isSupport)) {
            // Unassign
            String prevAssignee = ticket.getAssignedTo().getFullName();
            ticket.setAssignedTo(null);
            ticket.setStatus(TicketStatus.OPEN);
            saveHistory(ticket, updater, "ASSIGNMENT", prevAssignee, "UNASSIGNED");
        }

        Ticket updatedTicket = ticketRepository.save(ticket);
        auditLogService.log(updater, "TICKET_UPDATE", "Updated ticket #" + ticketId + ": " + details.toString(), "127.0.0.1");

        return updatedTicket;
    }

    @Transactional
    public Ticket assignTicket(Long ticketId, Long assigneeId, User assigner) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        assignTicketInternal(ticket, assigneeId, assigner);
        return ticketRepository.save(ticket);
    }

    private void assignTicketInternal(Ticket ticket, Long assigneeId, User assigner) {
        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));

        if (assignee.getRole().getName() != ERole.ROLE_SUPPORT) {
            throw new BadRequestException("Tickets can only be assigned to Support Engineers");
        }

        String oldValue = ticket.getAssignedTo() != null ? ticket.getAssignedTo().getFullName() : "UNASSIGNED";
        ticket.setAssignedTo(assignee);
        ticket.setStatus(TicketStatus.ASSIGNED);

        saveHistory(ticket, assigner, "ASSIGNMENT", oldValue, assignee.getFullName());
        auditLogService.log(assigner, "TICKET_ASSIGN", "Assigned ticket #" + ticket.getId() + " to " + assignee.getFullName(), "127.0.0.1");

        // Notify employee
        notificationService.createNotification(ticket.getCreatedBy(), "Your ticket #" + ticket.getId() + " has been assigned to " + assignee.getFullName(), ticket);
        // Notify assignee
        notificationService.createNotification(assignee, "Ticket #" + ticket.getId() + " has been assigned to you by " + assigner.getFullName(), ticket);

        // Emails
        emailService.sendTicketAssignedEmail(ticket.getCreatedBy().getEmail(), ticket.getId(), ticket.getTitle(), assignee.getFullName());
        emailService.sendTicketAssignedEmail(assignee.getEmail(), ticket.getId(), ticket.getTitle(), assignee.getFullName());
    }

    @Transactional
    public Ticket changeStatus(Long ticketId, TicketStatus status, User changer) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        changeStatusInternal(ticket, status, changer);
        return ticketRepository.save(ticket);
    }

    private void changeStatusInternal(Ticket ticket, TicketStatus newStatus, User changer) {
        TicketStatus oldStatus = ticket.getStatus();
        if (oldStatus == newStatus) return;

        ticket.setStatus(newStatus);
        if (newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.CLOSED) {
            ticket.setResolvedAt(LocalDateTime.now());
            emailService.sendTicketClosedEmail(ticket.getCreatedBy().getEmail(), ticket.getId(), ticket.getTitle());
        } else {
            ticket.setResolvedAt(null);
        }

        saveHistory(ticket, changer, "STATUS", oldStatus.name(), newStatus.name());
        auditLogService.log(changer, "TICKET_STATUS_CHANGE", "Changed status of ticket #" + ticket.getId() + " from " + oldStatus + " to " + newStatus, "127.0.0.1");

        // Notify creator
        if (!ticket.getCreatedBy().getId().equals(changer.getId())) {
            notificationService.createNotification(ticket.getCreatedBy(), "Status of ticket #" + ticket.getId() + " updated to " + newStatus, ticket);
        }
        // Notify assignee
        if (ticket.getAssignedTo() != null && !ticket.getAssignedTo().getId().equals(changer.getId())) {
            notificationService.createNotification(ticket.getAssignedTo(), "Status of ticket #" + ticket.getId() + " updated to " + newStatus, ticket);
        }
    }

    @Transactional
    public Ticket escalateTicket(Long ticketId, User changer) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        TicketPriority oldPriority = ticket.getPriority();
        TicketPriority newPriority = oldPriority;

        if (oldPriority == TicketPriority.LOW) newPriority = TicketPriority.MEDIUM;
        else if (oldPriority == TicketPriority.MEDIUM) newPriority = TicketPriority.HIGH;
        else if (oldPriority == TicketPriority.HIGH) newPriority = TicketPriority.CRITICAL;

        if (oldPriority == newPriority) {
            throw new BadRequestException("Ticket is already at CRITICAL priority and cannot be escalated further.");
        }

        ticket.setPriority(newPriority);
        saveHistory(ticket, changer, "ESCALATION", oldPriority.name(), newPriority.name());
        auditLogService.log(changer, "TICKET_ESCALATION", "Escalated ticket #" + ticketId + " priority from " + oldPriority + " to " + newPriority, "127.0.0.1");

        if (ticket.getAssignedTo() != null) {
            notificationService.createNotification(ticket.getAssignedTo(), "Ticket #" + ticket.getId() + " has been escalated to " + newPriority, ticket);
        }
        notificationService.createNotification(ticket.getCreatedBy(), "Your ticket #" + ticket.getId() + " has been escalated to " + newPriority, ticket);

        return ticketRepository.save(ticket);
    }

    @Transactional
    public Attachment uploadAttachment(Long ticketId, MultipartFile file, User uploader) throws IOException {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path targetLocation = this.fileStorageLocation.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation);

        Attachment attachment = Attachment.builder()
                .ticket(ticket)
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .filePath(fileName) // Store only filename relative to the uploads folder for portability
                .fileSize(file.getSize())
                .uploadedBy(uploader)
                .build();

        Attachment savedAttachment = attachmentRepository.save(attachment);

        saveHistory(ticket, uploader, "ATTACHMENT", "NONE", file.getOriginalFilename());
        auditLogService.log(uploader, "ATTACHMENT_UPLOAD", "Uploaded file: " + file.getOriginalFilename() + " for ticket #" + ticketId, "127.0.0.1");

        return savedAttachment;
    }

    public List<Attachment> getAttachments(Long ticketId) {
        return attachmentRepository.findByTicketId(ticketId);
    }

    public Attachment getAttachment(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));
    }

    public Ticket getTicketDetails(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
    }

    public List<TicketHistory> getTicketHistory(Long ticketId) {
        return historyRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
    }

    public List<Ticket> getFilteredTickets(String statusStr, String priorityStr, String categoryStr, String search, User user) {
        TicketStatus status = null;
        TicketPriority priority = null;
        TicketCategory category = null;

        if (statusStr != null && !statusStr.isEmpty() && !statusStr.equalsIgnoreCase("all")) {
            status = TicketStatus.valueOf(statusStr.toUpperCase());
        }
        if (priorityStr != null && !priorityStr.isEmpty() && !priorityStr.equalsIgnoreCase("all")) {
            priority = TicketPriority.valueOf(priorityStr.toUpperCase());
        }
        if (categoryStr != null && !categoryStr.isEmpty() && !categoryStr.equalsIgnoreCase("all")) {
            category = TicketCategory.valueOf(categoryStr.toUpperCase());
        }

        String searchKeyword = (search != null && !search.isEmpty()) ? search : null;

        Long createdById = null;
        Long assignedToId = null;

        if (user.getRole().getName() == ERole.ROLE_EMPLOYEE) {
            createdById = user.getId();
        } else if (user.getRole().getName() == ERole.ROLE_SUPPORT) {
            // Support roles can see all tickets in the system, or apply filters as needed
        }

        return ticketRepository.findWithFilters(status, priority, category, searchKeyword, createdById, assignedToId);
    }

    private void saveHistory(Ticket ticket, User changer, String type, String oldValue, String newValue) {
        TicketHistory history = TicketHistory.builder()
                .ticket(ticket)
                .changedBy(changer)
                .changeType(type)
                .oldValue(oldValue)
                .newValue(newValue)
                .build();
        historyRepository.save(history);
    }
}
