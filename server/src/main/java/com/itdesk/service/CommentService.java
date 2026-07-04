package com.itdesk.service;

import com.itdesk.dto.CommentRequest;
import com.itdesk.entity.Comment;
import com.itdesk.entity.Ticket;
import com.itdesk.entity.User;
import com.itdesk.exception.ResourceNotFoundException;
import com.itdesk.repository.CommentRepository;
import com.itdesk.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Comment addComment(Long ticketId, CommentRequest request, User user) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        Comment comment = Comment.builder()
                .ticket(ticket)
                .user(user)
                .commentText(request.getCommentText())
                .build();

        Comment savedComment = commentRepository.save(comment);

        String message = user.getFullName() + " commented on ticket #" + ticketId;
        if (user.getId().equals(ticket.getCreatedBy().getId())) {
            if (ticket.getAssignedTo() != null) {
                notificationService.createNotification(ticket.getAssignedTo(), message, ticket);
            }
        } else {
            notificationService.createNotification(ticket.getCreatedBy(), message, ticket);
        }

        return savedComment;
    }

    public List<Comment> getCommentsByTicket(Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }
}
