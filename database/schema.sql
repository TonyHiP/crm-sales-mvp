CREATE DATABASE IF NOT EXISTS `crm_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `crm_db`;

CREATE TABLE IF NOT EXISTS `roles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(50) NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `usuarios` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `rol_id` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO `roles` (`id`, `nombre`) VALUES 
(1, 'Administrador'), 
(2, 'Asesor de Ventas')
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol_id`) VALUES 
(1, 'Administrador CRM', 'admin@crm.com', '$2y$10$w34PFBAzhpuDEJ8hi5gqiuyWopAUg..oL0Qk0OMkDdkvHOjzVKEM6', 1)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);
