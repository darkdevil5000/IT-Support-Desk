package com.itdesk.repository;

import com.itdesk.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    @Query("SELECT t FROM Ticket t WHERE " +
            "(:status IS NULL OR t.status = :status) AND " +
            "(:priority IS NULL OR t.priority = :priority) AND " +
            "(:category IS NULL OR t.category = :category) AND " +
            "(:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:createdById IS NULL OR t.createdBy.id = :createdById) AND " +
            "(:assignedToId IS NULL OR t.assignedTo.id = :assignedToId) " +
            "ORDER BY t.createdAt DESC")
    List<Ticket> findWithFilters(
            @Param("status") TicketStatus status,
            @Param("priority") TicketPriority priority,
            @Param("category") TicketCategory category,
            @Param("search") String search,
            @Param("createdById") Long createdById,
            @Param("assignedToId") Long assignedToId
    );

    List<Ticket> findByCreatedById(Long userId);
    List<Ticket> findByAssignedToId(Long userId);

    long countByStatus(TicketStatus status);
    long countByPriority(TicketPriority priority);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.createdAt >= :dateTime")
    long countRecentTickets(@Param("dateTime") LocalDateTime dateTime);

    @Query("SELECT t.status, COUNT(t) FROM Ticket t GROUP BY t.status")
    List<Object[]> countTicketsByStatus();

    @Query("SELECT t.priority, COUNT(t) FROM Ticket t GROUP BY t.priority")
    List<Object[]> countTicketsByPriority();

    @Query("SELECT t.category, COUNT(t) FROM Ticket t GROUP BY t.category")
    List<Object[]> countTicketsByCategory();
}
