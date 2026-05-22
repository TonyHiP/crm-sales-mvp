CREATE DATABASE IF NOT EXISTS `crm_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `crm_db`;

CREATE TABLE IF NOT EXISTS `roles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(50) NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `usuarios` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `rol_id` INT NULL,
    `cedula` VARCHAR(10) NOT NULL UNIQUE,
    `nombres` VARCHAR(100) NOT NULL,
    `apellidos` VARCHAR(100) NOT NULL,
    `fecha_nacimiento` DATE NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `celular` VARCHAR(15) NULL,
    `password` VARCHAR(255) NOT NULL,
    `activo` TINYINT(1) NOT NULL DEFAULT 1,
    `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `proformas` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NOT NULL,
    `nombre_local` VARCHAR(150) NOT NULL,
    `monto_total` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `detalle_componentes` TEXT NOT NULL,
    `estado` ENUM('Prospeccion', 'Negociacion', 'Ganado') NOT NULL DEFAULT 'Prospeccion',
    `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO `roles` (`id`, `nombre`) VALUES 
(1, 'Administrador'), 
(2, 'Ejecutivo de Cuentas B2B')
AS nuevo_rol
ON DUPLICATE KEY UPDATE `nombre` = nuevo_rol.`nombre`;

INSERT INTO `usuarios` (`id`, `rol_id`, `cedula`, `nombres`, `apellidos`, `fecha_nacimiento`, `email`, `celular`, `password`) VALUES 
(1, 1, '0999999999', 'Admin', 'Importadora', '2000-01-01', 'admin@crm.com', '0999999999', '$2y$10$w34PFBAzhpuDEJ8hi5gqiuyWopAUg..oL0Qk0OMkDdkvHOjzVKEM6')
AS nuevo_usuario
ON DUPLICATE KEY UPDATE `nombres` = nuevo_usuario.`nombres`, `apellidos` = nuevo_usuario.`apellidos`, `email` = nuevo_usuario.`email`;
