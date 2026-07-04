package com.itdesk.service;

import com.itdesk.entity.Ticket;
import com.itdesk.repository.TicketRepository;
import com.lowagie.text.Document;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPCell;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private TicketRepository ticketRepository;

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public ByteArrayInputStream exportTicketsToExcel(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate) throws IOException {
        List<Ticket> tickets = ticketRepository.findAll();
        if (startDate != null && endDate != null) {
            tickets = tickets.stream()
                    .filter(t -> !t.getCreatedAt().isBefore(startDate) && !t.getCreatedAt().isAfter(endDate))
                    .collect(java.util.stream.Collectors.toList());
        } else if (startDate != null) {
            tickets = tickets.stream()
                    .filter(t -> !t.getCreatedAt().isBefore(startDate))
                    .collect(java.util.stream.Collectors.toList());
        } else if (endDate != null) {
            tickets = tickets.stream()
                    .filter(t -> !t.getCreatedAt().isAfter(endDate))
                    .collect(java.util.stream.Collectors.toList());
        }

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("IT Tickets");

            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] columns = {"ID", "Title", "Category", "Priority", "Status", "Created By", "Assigned To", "Created At"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Ticket ticket : tickets) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(ticket.getId());
                row.createCell(1).setCellValue(ticket.getTitle());
                row.createCell(2).setCellValue(ticket.getCategory().name());
                row.createCell(3).setCellValue(ticket.getPriority().name());
                row.createCell(4).setCellValue(ticket.getStatus().name());
                row.createCell(5).setCellValue(ticket.getCreatedBy().getFullName());
                row.createCell(6).setCellValue(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getFullName() : "Unassigned");
                row.createCell(7).setCellValue(ticket.getCreatedAt().format(formatter));
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    public ByteArrayInputStream exportTicketsToPdf(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate) {
        List<Ticket> tickets = ticketRepository.findAll();
        if (startDate != null && endDate != null) {
            tickets = tickets.stream()
                    .filter(t -> !t.getCreatedAt().isBefore(startDate) && !t.getCreatedAt().isAfter(endDate))
                    .collect(java.util.stream.Collectors.toList());
        } else if (startDate != null) {
            tickets = tickets.stream()
                    .filter(t -> !t.getCreatedAt().isBefore(startDate))
                    .collect(java.util.stream.Collectors.toList());
        } else if (endDate != null) {
            tickets = tickets.stream()
                    .filter(t -> !t.getCreatedAt().isAfter(endDate))
                    .collect(java.util.stream.Collectors.toList());
        }
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, out);

        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Paragraph title = new Paragraph("IT Help Desk Ticket Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);
        table.setSpacingAfter(10f);

        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.COURIER);
        PdfPCell c1 = new PdfPCell(new Phrase("ID", headerFont));
        table.addCell(c1);
        c1 = new PdfPCell(new Phrase("Title", headerFont));
        table.addCell(c1);
        c1 = new PdfPCell(new Phrase("Category", headerFont));
        table.addCell(c1);
        c1 = new PdfPCell(new Phrase("Priority", headerFont));
        table.addCell(c1);
        c1 = new PdfPCell(new Phrase("Status", headerFont));
        table.addCell(c1);
        c1 = new PdfPCell(new Phrase("Created By", headerFont));
        table.addCell(c1);
        c1 = new PdfPCell(new Phrase("Created At", headerFont));
        table.addCell(c1);

        Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 8);
        for (Ticket ticket : tickets) {
            table.addCell(new Phrase(ticket.getId().toString(), cellFont));
            table.addCell(new Phrase(ticket.getTitle(), cellFont));
            table.addCell(new Phrase(ticket.getCategory().name(), cellFont));
            table.addCell(new Phrase(ticket.getPriority().name(), cellFont));
            table.addCell(new Phrase(ticket.getStatus().name(), cellFont));
            table.addCell(new Phrase(ticket.getCreatedBy().getFullName(), cellFont));
            table.addCell(new Phrase(ticket.getCreatedAt().format(formatter), cellFont));
        }

        document.add(table);
        document.close();

        return new ByteArrayInputStream(out.toByteArray());
    }
}
