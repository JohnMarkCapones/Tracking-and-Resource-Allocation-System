-- Create holidays table if missing (fix for "Table 'tracking_resource_system.holidays' doesn't exist")
-- Run this against your DB if you don't use Laravel migrations, e.g.:
--   mysql -u root -p tracking_resource_system < database/create_holidays_table.sql

USE tracking_resource_system;

CREATE TABLE IF NOT EXISTS holidays (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_holidays_date (date)
);
