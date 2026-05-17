CREATE DATABASE IF NOT EXISTS `crm_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `crm_db`;

-- ========================================================
-- 1. ESTRUCTURA DE LA TABLA ROLES (Catálogo Maestro)
-- ========================================================
CREATE TABLE IF NOT EXISTS `roles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(50) NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ========================================================
-- 2. ESTRUCTURA DE LA TABLA USUARIOS (Información Normalizada)
-- ========================================================
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
    `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ========================================================
-- 3. SEMILLAS (SEEDS) - INSERCIÓN DE DATOS INICIALES
-- ========================================================

-- Inserción de Roles Base del Sistema con Sintaxis de Alias Moderna
INSERT INTO `roles` (`id`, `nombre`) VALUES 
(1, 'Administrador'), 
(2, 'Asesor de Ventas')
AS nuevo_rol
ON DUPLICATE KEY UPDATE `nombre` = nuevo_rol.`nombre`;

-- Inserción del Usuario Administrador por Defecto (Hash Protegido)
INSERT INTO `usuarios` (`id`, `rol_id`, `cedula`, `nombres`, `apellidos`, `fecha_nacimiento`, `email`, `celular`, `password`) VALUES 
(1, 1, '0999999999', 'Administrador', 'CRM', '2000-01-01', 'admin@crm.com', '0999999999', '$2y$10$w34PFBAzhpuDEJ8hi5gqiuyWopAUg..oL0Qk0OMkDdkvHOjzVKEM6')
AS nuevo_usuario
ON DUPLICATE KEY UPDATE `email` = nuevo_usuario.`email`;