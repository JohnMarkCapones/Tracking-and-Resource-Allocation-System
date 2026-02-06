/* ================================
   DATABASE CREATION
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
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    remember_token VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP
);

/* ================================
   TOOL CATEGORIES TABLE
================================ */

CREATE TABLE tool_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
