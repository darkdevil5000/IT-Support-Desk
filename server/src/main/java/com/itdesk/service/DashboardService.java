package com.itdesk.service;

import com.itdesk.entity.TicketCategory;
import com.itdesk.entity.TicketPriority;
import com.itdesk.entity.TicketStatus;
import com.itdesk.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private TicketRepository ticketRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long total = ticketRepository.count();
        long open = ticketRepository.countByStatus(TicketStatus.OPEN);
        long resolved = ticketRepository.countByStatus(TicketStatus.RESOLVED) + ticketRepository.countByStatus(TicketStatus.CLOSED);
        long critical = ticketRepository.countByPriority(TicketPriority.CRITICAL);
        
        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        long todayCount = ticketRepository.countRecentTickets(todayStart);

        stats.put("totalTickets", total);
        stats.put("openTickets", open);
        stats.put("resolvedTickets", resolved);
        stats.put("criticalTickets", critical);
        stats.put("todayTickets", todayCount);

        // Status breakdown
        Map<String, Long> statusBreakdown = new HashMap<>();
        for (TicketStatus status : TicketStatus.values()) {
            statusBreakdown.put(status.name(), ticketRepository.countByStatus(status));
        }
        stats.put("statusBreakdown", statusBreakdown);

        // Priority breakdown
        Map<String, Long> priorityBreakdown = new HashMap<>();
        for (TicketPriority priority : TicketPriority.values()) {
            priorityBreakdown.put(priority.name(), ticketRepository.countByPriority(priority));
        }
        stats.put("priorityBreakdown", priorityBreakdown);

        // Category breakdown
        Map<String, Long> categoryBreakdown = new HashMap<>();
        for (TicketCategory category : TicketCategory.values()) {
            long count = ticketRepository.findWithFilters(null, null, category, null, null, null).size();
            categoryBreakdown.put(category.name(), count);
        }
        stats.put("categoryBreakdown", categoryBreakdown);

        return stats;
    }
}
