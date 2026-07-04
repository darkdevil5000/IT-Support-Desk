package com.itdesk.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String text) {
        logger.info("SIMULATING EMAIL SENDING:");
        logger.info("To: {}", to);
        logger.info("Subject: {}", subject);
        logger.info("Body: {}", text);

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject(subject);
                message.setText(text);
                message.setFrom("noreply@itdesk.com");
                mailSender.send(message);
                logger.info("Email sent successfully via SMTP.");
            } catch (Exception e) {
                logger.warn("Could not send email via SMTP (using logging fallback): {}", e.getMessage());
            }
        }
    }

    public void sendTicketCreatedEmail(String to, Long ticketId, String title) {
        String subject = "IT Help Desk - Ticket Created: #" + ticketId;
        String body = "Dear User,\n\nYour ticket has been successfully created.\n\n" +
                "Ticket ID: #" + ticketId + "\n" +
                "Title: " + title + "\n\n" +
                "Our Support Engineers will review it shortly.\n\nBest Regards,\nIT Support Team";
        sendEmail(to, subject, body);
    }

    public void sendTicketAssignedEmail(String to, Long ticketId, String title, String assigneeName) {
        String subject = "IT Help Desk - Ticket Assigned: #" + ticketId;
        String body = "Dear User,\n\nYour ticket #" + ticketId + " (" + title + ") has been assigned to " + assigneeName + ".\n\n" +
                "They will start investigating your request shortly.\n\nBest Regards,\nIT Support Team";
        sendEmail(to, subject, body);
    }

    public void sendTicketClosedEmail(String to, Long ticketId, String title) {
        String subject = "IT Help Desk - Ticket Closed: #" + ticketId;
        String body = "Dear User,\n\nYour ticket #" + ticketId + " (" + title + ") has been marked as RESOLVED/CLOSED.\n\n" +
                "If the issue persists, you can reopen it via the dashboard.\n\nBest Regards,\nIT Support Team";
        sendEmail(to, subject, body);
    }

    public void sendPasswordResetEmail(String to, String token) {
        String subject = "IT Help Desk - Password Reset Request";
        String body = "Dear User,\n\nYou requested a password reset. Please use the following token on the password reset page:\n\n" +
                "Token: " + token + "\n\n" +
                "This token will expire in 24 hours.\n\nBest Regards,\nIT Support Team";
        sendEmail(to, subject, body);
    }
}
