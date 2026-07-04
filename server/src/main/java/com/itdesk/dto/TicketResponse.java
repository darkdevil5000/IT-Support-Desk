package com.itdesk.dto;

import com.itdesk.entity.Ticket;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class TicketResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;
    
    private Long createdById;
    private String createdByFullName;
    private String createdByEmail;
    private String createdByDepartment;

    private Long assignedToId;
    private String assignedToFullName;
    private String assignedToEmail;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    public static TicketResponse fromEntity(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setTitle(ticket.getTitle());
        response.setDescription(ticket.getDescription());
        response.setCategory(ticket.getCategory().name());
        response.setPriority(ticket.getPriority().name());
        response.setStatus(ticket.getStatus().name());
        
        if (ticket.getCreatedBy() != null) {
            response.setCreatedById(ticket.getCreatedBy().getId());
            response.setCreatedByFullName(ticket.getCreatedBy().getFullName());
            response.setCreatedByEmail(ticket.getCreatedBy().getEmail());
            response.setCreatedByDepartment(ticket.getCreatedBy().getDepartment());
        }

        if (ticket.getAssignedTo() != null) {
            response.setAssignedToId(ticket.getAssignedTo().getId());
            response.setAssignedToFullName(ticket.getAssignedTo().getFullName());
            response.setAssignedToEmail(ticket.getAssignedTo().getEmail());
        }

        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());
        response.setResolvedAt(ticket.getResolvedAt());
        return response;
    }
}
