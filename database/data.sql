-- Seed Roles
INSERT INTO roles (id, name) VALUES (1, 'ROLE_ADMIN') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO roles (id, name) VALUES (2, 'ROLE_SUPPORT') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO roles (id, name) VALUES (3, 'ROLE_EMPLOYEE') ON DUPLICATE KEY UPDATE name=name;

-- Seed Users (Password is 'password123' BCrypt encrypted: $2a$10$8.23nvxL41yT3tS4fMGLxOQy0nN9G2.9Vj84eHw69u7nZ1L8l1i.y)
INSERT INTO users (id, username, email, password, full_name, role_id, phone, department, status) VALUES 
(1, 'admin', 'admin@itdesk.com', '$2a$10$8.23nvxL41yT3tS4fMGLxOQy0nN9G2.9Vj84eHw69u7nZ1L8l1i.y', 'Ankur Sutradhar (Admin)', 1, '+1234567890', 'IT Administration', 'ACTIVE'),
(2, 'support1', 'support1@itdesk.com', '$2a$10$8.23nvxL41yT3tS4fMGLxOQy0nN9G2.9Vj84eHw69u7nZ1L8l1i.y', 'Sarah Jenkins (Support L1)', 2, '+1234567891', 'Global Application Support', 'ACTIVE'),
(3, 'support2', 'support2@itdesk.com', '$2a$10$8.23nvxL41yT3tS4fMGLxOQy0nN9G2.9Vj84eHw69u7nZ1L8l1i.y', 'David Miller (Network Ops)', 2, '+1234567892', 'Network Engineering', 'ACTIVE'),
(4, 'employee1', 'emp1@itdesk.com', '$2a$10$8.23nvxL41yT3tS4fMGLxOQy0nN9G2.9Vj84eHw69u7nZ1L8l1i.y', 'Alice Johnson (Developer)', 3, '+1234567893', 'Software Engineering', 'ACTIVE'),
(5, 'employee2', 'emp2@itdesk.com', '$2a$10$8.23nvxL41yT3tS4fMGLxOQy0nN9G2.9Vj84eHw69u7nZ1L8l1i.y', 'Bob Smith (Finance)', 3, '+1234567894', 'Finance & Accounting', 'ACTIVE')
ON DUPLICATE KEY UPDATE username=username;

-- Seed Tickets
INSERT INTO tickets (id, title, description, category, priority, status, created_by_id, assigned_to_id) VALUES
(1, 'VPN Connection Failure', 'Unable to establish VPN connection since morning. Getting error code 800.', 'Network', 'High', 'ASSIGNED', 4, 3),
(2, 'Intelij License renewal', 'Need my IntelliJ IDEA license renewed for development work.', 'Software', 'Medium', 'OPEN', 4, NULL),
(3, 'Laptop Battery Overheating', 'My Macbook battery is draining very fast and overheating during video calls.', 'Hardware', 'Critical', 'IN_PROGRESS', 5, 2),
(4, 'Database slow query response', 'SQL Queries on database dev-db-1 are taking over 10 seconds to execute.', 'Database', 'High', 'PENDING', 4, 3),
(5, 'Suspicious Email Report', 'Received an email claiming to be from HR asking for bank details. Potentially phishing.', 'Security', 'Critical', 'RESOLVED', 5, 2)
ON DUPLICATE KEY UPDATE title=title;

-- Seed Comments
INSERT INTO comments (id, ticket_id, user_id, comment_text) VALUES
(1, 1, 3, 'Checking routing tables on VPN Gateway. Please try pinging 10.0.0.1.'),
(2, 1, 4, 'Still unable to connect. Pings are timed out.'),
(3, 3, 2, 'Diagnostic run started. Checking battery health status and process hogging.')
ON DUPLICATE KEY UPDATE comment_text=comment_text;

-- Seed Ticket History
INSERT INTO ticket_history (id, ticket_id, changed_by_id, change_type, old_value, new_value) VALUES
(1, 1, 1, 'ASSIGNMENT', 'UNASSIGNED', 'David Miller (Network Ops)'),
(2, 3, 2, 'STATUS', 'OPEN', 'IN_PROGRESS'),
(3, 5, 2, 'STATUS', 'IN_PROGRESS', 'RESOLVED')
ON DUPLICATE KEY UPDATE change_type=change_type;
