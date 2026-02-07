/* ================================
   DATABASE CREATION
   Schema aligned with ToolSync API (routes/api.php).
   Tables support: user, tool-categories, tools, tool-allocations, tool-status-logs,
   dashboard, favorites, reservations, admin/users, settings, maintenance-schedules,
   tool-deprecations, departments, activity-logs, analytics (overview, export, usage-heatmap).
================================ */

CREATE DATABASE IF NOT EXISTS tracking_resource_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tracking_resource_system;

/* ================================
   USERS TABLE
================================ */

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL DEFAULT NULL,
    password VARCHAR(255) NULL DEFAULT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    remember_token VARCHAR(100) DEFAULT NULL,
    provider VARCHAR(50) DEFAULT NULL,
    provider_id VARCHAR(255) DEFAULT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_users_provider (provider, provider_id)
);

/* ================================
   TOOL CATEGORIES TABLE
================================ */

CREATE TABLE tool_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

/* ================================
   TOOLS TABLE
================================ */

CREATE TABLE tools (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT DEFAULT NULL,
    image_path VARCHAR(255) DEFAULT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    status ENUM('AVAILABLE', 'BORROWED', 'MAINTENANCE') 
        NOT NULL DEFAULT 'AVAILABLE',
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tools_category
        FOREIGN KEY (category_id) 
        REFERENCES tool_categories(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

/* ================================
   TOOL ALLOCATIONS (BORROW HISTORY)
================================ */

CREATE TABLE tool_allocations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tool_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    borrow_date DATETIME NOT NULL,
    expected_return_date DATETIME NOT NULL,
    actual_return_date DATETIME DEFAULT NULL,
    note TEXT DEFAULT NULL,
    status ENUM('BORROWED', 'RETURNED') 
        NOT NULL DEFAULT 'BORROWED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_allocation_tool
        FOREIGN KEY (tool_id) 
        REFERENCES tools(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_allocation_user
        FOREIGN KEY (user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

/* ================================
   TOOL STATUS LOGS (OPTIONAL)
================================ */

CREATE TABLE tool_status_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tool_id BIGINT UNSIGNED NOT NULL,
    old_status ENUM('AVAILABLE', 'BORROWED', 'MAINTENANCE'),
    new_status ENUM('AVAILABLE', 'BORROWED', 'MAINTENANCE'),
    changed_by BIGINT UNSIGNED DEFAULT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_status_tool
        FOREIGN KEY (tool_id) 
        REFERENCES tools(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_status_user
        FOREIGN KEY (changed_by) 
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

/* ================================
   FAVORITES TABLE
================================ */

CREATE TABLE favorites (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    tool_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_favorites_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_favorites_tool
        FOREIGN KEY (tool_id)
        REFERENCES tools(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    UNIQUE KEY uniq_favorites_user_tool (user_id, tool_id)
);

/* ================================
   RESERVATIONS TABLE
================================ */

CREATE TABLE reservations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tool_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    status ENUM('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'UPCOMING',
    recurring TINYINT(1) NOT NULL DEFAULT 0,
    recurrence_pattern VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reservations_tool
        FOREIGN KEY (tool_id)
        REFERENCES tools(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_reservations_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

/* ================================
   PERSONAL ACCESS TOKENS (Sanctum API auth)
================================ */

CREATE TABLE personal_access_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    abilities TEXT DEFAULT NULL,
    last_used_at TIMESTAMP NULL DEFAULT NULL,
    expires_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pat_tokenable (tokenable_type, tokenable_id),
    INDEX idx_pat_expires (expires_at)
);

/* ================================
   DEPARTMENTS TABLE
================================ */

CREATE TABLE departments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE users
    ADD COLUMN department_id BIGINT UNSIGNED NULL AFTER status,
    ADD CONSTRAINT fk_users_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE SET NULL ON UPDATE CASCADE;

/* ================================
   MAINTENANCE SCHEDULES TABLE
================================ */

CREATE TABLE maintenance_schedules (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tool_id BIGINT UNSIGNED NOT NULL,
    type VARCHAR(50) NOT NULL,
    scheduled_date DATE NOT NULL,
    completed_date DATE DEFAULT NULL,
    assignee VARCHAR(150) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'scheduled',
    notes TEXT DEFAULT NULL,
    usage_count INT UNSIGNED NOT NULL DEFAULT 0,
    trigger_threshold INT UNSIGNED NOT NULL DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_maintenance_tool
        FOREIGN KEY (tool_id) REFERENCES tools(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_maintenance_status (status),
    INDEX idx_maintenance_scheduled (scheduled_date)
);

/* ================================
   TOOL DEPRECATIONS TABLE
================================ */

CREATE TABLE tool_deprecations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tool_id BIGINT UNSIGNED NOT NULL,
    reason VARCHAR(255) NOT NULL,
    retire_date DATE NOT NULL,
    replacement_tool_id BIGINT UNSIGNED DEFAULT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_deprecation_tool
        FOREIGN KEY (tool_id) REFERENCES tools(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_deprecation_replacement
        FOREIGN KEY (replacement_tool_id) REFERENCES tools(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_deprecation_status (status)
);

/* ================================
   SYSTEM SETTINGS TABLE
================================ */

CREATE TABLE system_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(100) NOT NULL UNIQUE,
    value TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

/* ================================
   BUSINESS HOURS TABLE
================================ */

CREATE TABLE business_hours (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    day_of_week TINYINT UNSIGNED NOT NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_business_hours_day (day_of_week)
);

/* ================================
   HOLIDAYS TABLE
================================ */

CREATE TABLE holidays (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_holidays_date (date)
);

/* ================================
   AUTO APPROVAL RULES TABLE
================================ */

CREATE TABLE auto_approval_rules (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    `condition` VARCHAR(255) NOT NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

/* ================================
   ACTIVITY LOGS TABLE
================================ */

CREATE TABLE activity_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED DEFAULT NULL,
    action VARCHAR(80) NOT NULL,
    subject_type VARCHAR(100) DEFAULT NULL,
    subject_id BIGINT UNSIGNED DEFAULT NULL,
    description TEXT DEFAULT NULL,
    properties JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_activity_subject (subject_type, subject_id),
    INDEX idx_activity_created (created_at)
);

/* ================================
   INDEXES (PERFORMANCE)
================================ */

CREATE INDEX idx_tools_status ON tools(status);
CREATE INDEX idx_tools_name ON tools(name);
CREATE INDEX idx_allocations_user ON tool_allocations(user_id);
CREATE INDEX idx_allocations_tool ON tool_allocations(tool_id);
CREATE INDEX idx_allocations_status ON tool_allocations(status);

/* ================================
   OPTIONAL SEED DATA
================================ */

INSERT INTO tool_categories (name) VALUES
('IT Equipment'),
('Office Equipment'),
('Multimedia');

INSERT INTO tools (name, description, image_path, category_id, quantity) VALUES
('Printer', 'Office printer for document printing', 'images/tools/printer.png', 2, 5),
('Projector', 'HD projector for presentations', 'images/tools/projector.png', 3, 5),
('Projector Screen', 'Foldable projection screen', 'images/tools/screen.png', 3, 5),
('Laptop', 'Portable laptop for academic use', 'images/tools/laptop.png', 1, 5),
('Keyboard', 'USB keyboard', 'images/tools/keyboard.png', 1, 5),
('Headset', 'Noise-cancelling headset', 'images/tools/headset.png', 1, 5),
('Camera', 'Digital camera for media tasks', 'images/tools/camera.png', 3, 5),
('Mouse', 'Optical USB mouse', 'images/tools/mouse.png', 1, 5);

/* ================================
   SEED: SYSTEM SETTINGS & RULES
================================ */

INSERT INTO system_settings (`key`, value) VALUES
('max_borrowings', '3'),
('max_duration', '14'),
('default_duration', '7'),
('reminder_days', '2'),
('overdue_escalation_days', '3');

INSERT INTO business_hours (day_of_week, enabled, open_time, close_time) VALUES
(0, 0, '09:00', '13:00'),
(1, 1, '08:00', '17:00'),
(2, 1, '08:00', '17:00'),
(3, 1, '08:00', '17:00'),
(4, 1, '08:00', '17:00'),
(5, 1, '08:00', '17:00'),
(6, 0, '09:00', '13:00');

INSERT INTO auto_approval_rules (name, `condition`, enabled) VALUES
('Admin auto-approve', 'User role is Admin', 1),
('Short-term borrow', 'Duration <= 3 days', 1),
('Low-value tools', 'Tool category is Consumables', 0);

/* ================================
   API → TABLES REFERENCE (routes/api.php)
================================
GET    /user                          → users
GET    /dashboard                     → tool_allocations, tools, users
GET    /analytics/overview            → tool_allocations, tools
GET    /analytics/export              → tool_allocations
GET    /analytics/usage-heatmap       → tool_allocations
apiResource tool-categories           → tool_categories
apiResource tools                    → tools, tool_categories
GET    tools/{id}/availability       → tools, tool_allocations, reservations
apiResource tool-allocations         → tool_allocations, tools, users
GET    tool-allocations/history       → tool_allocations
GET    tool-allocations/export        → tool_allocations
apiResource tool-status-logs         → tool_status_logs
auth:sanctum:
  GET/POST/DELETE favorites          → favorites (users, tools)
  GET/POST/PUT reservations          → reservations (tools, users)
  GET/PUT admin/users                → users, departments
  GET/PUT settings                   → system_settings, business_hours, holidays, auto_approval_rules
  apiResource maintenance-schedules  → maintenance_schedules, tools
  apiResource tool-deprecations      → tool_deprecations, tools
  apiResource departments            → departments, users
  GET activity-logs                  → activity_logs, users
================================ */
