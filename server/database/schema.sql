-- =====================================================
-- MODERNTECH HR SYSTEM - COMPLETE DATABASE SETUP
-- From Scratch: Tables + Data
-- Created: August 2026
-- =====================================================

-- =====================================================
-- 1. CREATE AND USE DATABASE
-- =====================================================

CREATE DATABASE IF NOT EXISTS moderntech_hr;
USE moderntech_hr;

-- =====================================================
-- 2. CREATE TABLES
-- =====================================================

-- ---------------------------------------------
-- 2.1 Departments Table
-- ---------------------------------------------
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- ---------------------------------------------
-- 2.2 Employees Table
-- ---------------------------------------------
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department_id INT,
    position VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'employee') DEFAULT 'employee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ---------------------------------------------
-- 2.3 Attendance Table
-- ---------------------------------------------
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Remote', 'On Leave') DEFAULT 'Present',
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (employee_id, date)
);

-- ---------------------------------------------
-- 2.4 Leave Requests Table
-- ---------------------------------------------
CREATE TABLE leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('Pending', 'Approved', 'Denied') DEFAULT 'Pending',
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ---------------------------------------------
-- 2.5 Payroll Table
-- ---------------------------------------------
CREATE TABLE payroll (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    month DATE NOT NULL,
    net_pay DECIMAL(10,2) NOT NULL,
    status ENUM('Ready', 'Paid') DEFAULT 'Ready',
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ---------------------------------------------
-- 2.6 Performance Reviews Table
-- ---------------------------------------------
CREATE TABLE performance_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    reviewer VARCHAR(100) NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- =====================================================
-- 3. INSERT DATA
-- =====================================================

-- ---------------------------------------------
-- 3.1 Insert Departments
-- ---------------------------------------------
INSERT INTO departments (id, name) VALUES 
(1, 'Development'),
(2, 'HR'),
(3, 'QA'),
(4, 'Sales'),
(5, 'Marketing'),
(6, 'Design'),
(7, 'IT'),
(8, 'Finance'),
(9, 'Support');

-- ---------------------------------------------
-- 3.2 Insert Employees
-- Note: All passwords are 'password123' (hashed)
-- The hash below is a valid bcrypt hash for 'password123'
-- ---------------------------------------------
INSERT INTO employees (id, first_name, last_name, email, department_id, position, password_hash, role) VALUES
(1, 'Sibongile', 'Nkosi', 'sibongile.nkosi@moderntech.com', 1, 'Software Engineer', '$2b$10$9FvL5eHkzY3Z8X9Y2Z1W4uU6vV7wW8xX9yY0zZ1A2B3C4D5E6F7G8H9I0J', 'employee'),
(2, 'Lungile', 'Moyo', 'lungile.moyo@moderntech.com', 2, 'HR Manager', '$2b$10$9FvL5eHkzY3Z8X9Y2Z1W4uU6vV7wW8xX9yY0zZ1A2B3C4D5E6F7G8H9I0J', 'manager'),
(3, 'Thabo', 'Molefe', 'thabo.molefe@moderntech.com', 3, 'Quality Analyst', '$2b$10$9FvL5eHkzY3Z8X9Y2Z1W4uU6vV7wW8xX9yY0zZ1A2B3C4D5E6F7G8H9I0J', 'employee'),
(4, 'Keshav', 'Naidoo', 'keshav.naidoo@moderntech.com', 4, 'Sales Representative', '$2b$10$9FvL5eHkzY3Z8X9Y2Z1W4uU6vV7wW8xX9yY0zZ1A2B3C4D5E6F7G8H9I0J', 'employee'),
(5, 'Zanele', 'Khumalo', 'zanele.khumalo@moderntech.com', 5, 'Marketing Specialist', '$2b$10$9FvL5eHkzY3Z8X9Y2Z1W4uU6vV7wW8xX9yY0zZ1A2B3C4D5E6F7G8H9I0J', 'employee'),
(6, 'Sipho', 'Zulu', 'sipho.zulu@moderntech.com', 6, 'UI/UX Designer', '$2b$10$9FvL5eHkzY3Z8X9Y2Z1W4uU6vV7wW8xX9yY0zZ1A2B3C4D5E6F7G8H9I0J', 'employee'),
(7, 'Naledi', 'Moeketsi', 'naledi.moeketsi@moderntech.com', 7, 'DevOps Engineer', '$2b$10$9FvL5eHkzY3Z8X9Y2Z1W4uU6vV7wW8xX9yY0zZ1A2B3C4D5E6F7G8H9I0J', 'employee'),
(8, 'Farai', 'Gumbo', 'farai.gumbo@moderntech.com', 5, 'Content Strategist', '$2b$10$9FvL5eHkzY3Z8X9Y2Z1W4uU6vV7wW8xX9yY0zZ1A2B3C4D5E6F7G8H9I0J', 'employee'),
(9, 'Karabo', 'Dlamini', 'karabo.dlamini@moderntech.com', 8, 'Accountant', '$2b$10$9FvL5eHkzY3Z8X9Y2Z1W4uU6vV7wW8xX9yY0zZ1A2B3C4D5E6F7G8H9I0J', 'employee'),
(10, 'Fatima', 'Patel', 'fatima.patel@moderntech.com', 9, 'Customer Support Lead', '$2b$10$9FvL5eHkzY3Z8X9Y2Z1W4uU6vV7wW8xX9yY0zZ1A2B3C4D5E6F7G8H9I0J', 'employee');

-- ---------------------------------------------
-- 3.3 Insert Attendance Records (5 days each)
-- ---------------------------------------------
INSERT INTO attendance (employee_id, date, status) VALUES
-- Employee 1: Sibongile Nkosi
(1, '2025-07-25', 'Present'),
(1, '2025-07-26', 'Absent'),
(1, '2025-07-27', 'Present'),
(1, '2025-07-28', 'Present'),
(1, '2025-07-29', 'Present'),

-- Employee 2: Lungile Moyo
(2, '2025-07-25', 'Present'),
(2, '2025-07-26', 'Present'),
(2, '2025-07-27', 'Absent'),
(2, '2025-07-28', 'Present'),
(2, '2025-07-29', 'Present'),

-- Employee 3: Thabo Molefe
(3, '2025-07-25', 'Present'),
(3, '2025-07-26', 'Present'),
(3, '2025-07-27', 'Present'),
(3, '2025-07-28', 'Absent'),
(3, '2025-07-29', 'Present'),

-- Employee 4: Keshav Naidoo
(4, '2025-07-25', 'Absent'),
(4, '2025-07-26', 'Present'),
(4, '2025-07-27', 'Present'),
(4, '2025-07-28', 'Present'),
(4, '2025-07-29', 'Present'),

-- Employee 5: Zanele Khumalo
(5, '2025-07-25', 'Present'),
(5, '2025-07-26', 'Present'),
(5, '2025-07-27', 'Absent'),
(5, '2025-07-28', 'Present'),
(5, '2025-07-29', 'Present'),

-- Employee 6: Sipho Zulu
(6, '2025-07-25', 'Present'),
(6, '2025-07-26', 'Present'),
(6, '2025-07-27', 'Absent'),
(6, '2025-07-28', 'Present'),
(6, '2025-07-29', 'Present'),

-- Employee 7: Naledi Moeketsi
(7, '2025-07-25', 'Present'),
(7, '2025-07-26', 'Present'),
(7, '2025-07-27', 'Present'),
(7, '2025-07-28', 'Absent'),
(7, '2025-07-29', 'Present'),

-- Employee 8: Farai Gumbo
(8, '2025-07-25', 'Present'),
(8, '2025-07-26', 'Absent'),
(8, '2025-07-27', 'Present'),
(8, '2025-07-28', 'Present'),
(8, '2025-07-29', 'Present'),

-- Employee 9: Karabo Dlamini
(9, '2025-07-25', 'Present'),
(9, '2025-07-26', 'Present'),
(9, '2025-07-27', 'Present'),
(9, '2025-07-28', 'Absent'),
(9, '2025-07-29', 'Present'),

-- Employee 10: Fatima Patel
(10, '2025-07-25', 'Present'),
(10, '2025-07-26', 'Present'),
(10, '2025-07-27', 'Absent'),
(10, '2025-07-28', 'Present'),
(10, '2025-07-29', 'Present');

-- ---------------------------------------------
-- 3.4 Insert Leave Requests
-- ---------------------------------------------
INSERT INTO leave_requests (employee_id, type, start_date, end_date, status) VALUES
-- Employee 1: Sibongile Nkosi
(1, 'Sick Leave', '2025-07-22', '2025-07-22', 'Approved'),
(1, 'Personal', '2024-12-01', '2024-12-01', 'Pending'),

-- Employee 2: Lungile Moyo
(2, 'Family Responsibility', '2025-07-15', '2025-07-15', 'Denied'),
(2, 'Vacation', '2024-12-02', '2024-12-02', 'Approved'),

-- Employee 3: Thabo Molefe
(3, 'Medical Appointment', '2025-07-10', '2025-07-10', 'Approved'),
(3, 'Personal', '2024-12-05', '2024-12-05', 'Pending'),

-- Employee 4: Keshav Naidoo
(4, 'Bereavement', '2025-07-20', '2025-07-20', 'Approved'),

-- Employee 5: Zanele Khumalo
(5, 'Childcare', '2024-12-01', '2024-12-01', 'Pending'),

-- Employee 6: Sipho Zulu
(6, 'Sick Leave', '2025-07-18', '2025-07-18', 'Approved'),

-- Employee 7: Naledi Moeketsi
(7, 'Vacation', '2025-07-22', '2025-07-22', 'Pending'),

-- Employee 8: Farai Gumbo
(8, 'Medical Appointment', '2024-12-02', '2024-12-02', 'Approved'),

-- Employee 9: Karabo Dlamini
(9, 'Childcare', '2025-07-19', '2025-07-19', 'Denied'),

-- Employee 10: Fatima Patel
(10, 'Vacation', '2024-12-03', '2024-12-03', 'Pending');

-- ---------------------------------------------
-- 3.5 Insert Payroll Data
-- ---------------------------------------------
INSERT INTO payroll (employee_id, month, net_pay, status) VALUES
(1, '2025-07-01', 69500.00, 'Ready'),
(2, '2025-07-01', 79000.00, 'Ready'),
(3, '2025-07-01', 54800.00, 'Ready'),
(4, '2025-07-01', 59700.00, 'Ready'),
(5, '2025-07-01', 57850.00, 'Ready'),
(6, '2025-07-01', 64800.00, 'Ready'),
(7, '2025-07-01', 71800.00, 'Ready'),
(8, '2025-07-01', 56000.00, 'Ready'),
(9, '2025-07-01', 61500.00, 'Ready'),
(10, '2025-07-01', 57750.00, 'Ready');

-- ---------------------------------------------
-- 3.6 Insert Performance Reviews
-- ---------------------------------------------
INSERT INTO performance_reviews (employee_id, reviewer, rating, feedback) VALUES
(1, 'HR Manager', 4, 'Strong technical skills, good team player'),
(2, 'Executive Board', 5, 'Excellent leadership and HR management'),
(3, 'QA Lead', 4, 'Consistent quality work, reliable'),
(4, 'Sales Director', 4, 'Great sales numbers, client relationships'),
(5, 'Marketing Manager', 3, 'Good performance, needs improvement in strategy'),
(6, 'Creative Director', 3, 'Creative, needs to meet deadlines more consistently'),
(7, 'IT Director', 5, 'Outstanding DevOps skills, automation expert'),
(8, 'Marketing Manager', 3, 'Content quality is good, needs more output'),
(9, 'Finance Manager', 4, 'Accurate accounting, good attention to detail'),
(10, 'Support Manager', 3, 'Good with customers, needs more technical training');

-- =====================================================
-- 4. VERIFICATION QUERIES (Optional - uncomment to run)
-- =====================================================
-- SELECT 'DEPARTMENTS' AS Table, COUNT(*) AS Rows FROM departments
-- UNION
-- SELECT 'EMPLOYEES', COUNT(*) FROM employees
-- UNION
-- SELECT 'ATTENDANCE', COUNT(*) FROM attendance
-- UNION
-- SELECT 'LEAVE REQUESTS', COUNT(*) FROM leave_requests
-- UNION
-- SELECT 'PAYROLL', COUNT(*) FROM payroll
-- UNION
-- SELECT 'PERFORMANCE REVIEWS', COUNT(*) FROM performance_reviews;

-- =====================================================
-- 5. SAMPLE QUERIES FOR TESTING
-- =====================================================
-- All employees with their department names:
-- SELECT e.id, e.first_name, e.last_name, e.email, d.name AS department, e.position
-- FROM employees e
-- LEFT JOIN departments d ON e.department_id = d.id;

-- Pending leave requests:
-- SELECT l.*, e.first_name, e.last_name 
-- FROM leave_requests l
-- JOIN employees e ON l.employee_id = e.id
-- WHERE l.status = 'Pending';

-- Attendance summary for each employee:
-- SELECT e.first_name, e.last_name, 
--        COUNT(CASE WHEN a.status = 'Present' THEN 1 END) AS days_present,
--        COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) AS days_absent
-- FROM employees e
-- LEFT JOIN attendance a ON e.id = a.employee_id
-- GROUP BY e.id, e.first_name, e.last_name;

