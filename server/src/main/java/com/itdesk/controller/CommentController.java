package com.itdesk.controller;

import com.itdesk.dto.CommentRequest;
import com.itdesk.entity.Comment;
import com.itdesk.entity.User;
import com.itdesk.exception.ResourceNotFoundException;
import com.itdesk.repository.UserRepository;
import com.itdesk.security.UserPrincipal;
import com.itdesk.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Comment> addComment(@PathVariable Long ticketId,
                                              @Valid @RequestBody CommentRequest request,
                                              @AuthenticationPrincipal UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(commentService.addComment(ticketId, request, user));
    }

    @GetMapping
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long ticketId) {
        return ResponseEntity.ok(commentService.getCommentsByTicket(ticketId));
    }
}
