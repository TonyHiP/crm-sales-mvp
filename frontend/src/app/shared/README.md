# CRM Sales B2B - Portal de Distribución Mayorista de Hardware

Este proyecto es un sistema de administración de relaciones con clientes (CRM) diseñado para el Sprint 4 de un Portal Privado B2B de importación y distribución de hardware tecnológico en Ecuador. Desarrollado con una arquitectura moderna, segura, minimalista y libre de sobreingeniería.

---

## 🛠️ Tecnologías y Arquitectura

El sistema se compone de tres capas integradas:

1.  **Frontend (Angular SPA)**:
    *   Arquitectura modular de **Componentes Standalone**.
    *   Control de flujo moderno (`@for`, `@if` y `@empty`).
    *   Inyección moderna de servicios mediante la función `inject(HttpClient)`.
    *   Hoja de estilos **Vanilla CSS Puro** enfocada en una experiencia de usuario premium, fluida y con micro-animaciones en tarjetas y formularios.
    *   Protección activa de enrutamiento con **Guardianes Funcionales** (`CanActivateFn`) y **Rehidratación de Sesión** ante refrescos (F5) en el componente raíz.

2.  **Backend (API REST en PHP Puro)**:
    *   Conexión de datos encapsulada y persistencia mediante **PDO (PHP Data Objects)**.
    *   **Sentencias Preparadas** nativas para garantizar inmunidad total contra Inyecciones SQL (SQLi).
    *   Cabeceras estándar **CORS** implementadas para permitir una comunicación fluida entre el puerto local de desarrollo de Angular y el de PHP.
    *   Manejo de estados con códigos de respuesta HTTP adecuados (`200 OK`, `201 Created`, `401 Unauthorized`, `400 Bad Request`).

3.  **Base de Datos (MariaDB / MySQL)**:
    *   Estructura relacional limpia con tablas para `roles`, `usuarios` (con control de estado booleano) y `proformas` (con eliminación en cascada integrada para conservar la integridad física).

---

## 🚀 Módulos Clave del Sprint 4

### 1. Directorio de Leads e Inventario Simplificado (`LeadsComponent`)
*   Formulario reactivo para registrar solicitudes comerciales (proformas) con campo de texto libre para el inventario de piezas a importar.
*   **Exportación CSV Nativa**: Conversión puramente en el cliente (JavaScript nativo, sin dependencias externas) estructurando cabeceras, escapando comillas dobles y con soporte BOM UTF-8 para compatibilidad en Excel.

### 2. Pipeline Comercial Kanban (`VentasComponent`)
*   Tablero de 3 columnas verticales responsivas maquetadas en CSS Grid/Flexbox: **Prospección**, **Negociación** y **Ganado**.
*   Filtros reactivos mediante getters puros que calculan en vivo:
    *   La cantidad de proformas por etapa.
    *   El acumulado financiero ($ USD) por columna en tiempo real.
*   Botones de control sencillos e intuitivos para avanzar o retroceder proformas entre etapas.

### 3. Gestión y Estado Comercial de Asesores (`ConfigComponent`)
*   Directorio de asesores registrados que permite suspender o activar cuentas comerciales.
*   **Seguridad Contable**: Un asesor inactivo no podrá loguearse en el sistema, pero su registro físico permanece para salvaguardar el histórico financiero de sus ventas.

### 4. Capa de Seguridad y Persistencia
*   **F5 Rehydration**: Evita expulsiones accidentales. El componente raíz reconstruye el estado global de autenticación desde el `localStorage` al refrescar la página.
*   **CanActivateFn Guard**: Restringe físicamente el acceso a las vistas de Ajustes y Registro de Personal únicamente a usuarios con Rol de Administrador, expulsando a asesores al Dashboard de forma automática.

---

## ⚙️ Instrucciones de Instalación y Despliegue

### 1. Base de Datos
1.  Asegúrate de tener un servidor MySQL/MariaDB activo (por ejemplo, mediante XAMPP).
2.  Crea la base de datos `crm_db`.
3.  Importa el script SQL de estructura y semillas ubicado en:
    `database/schema.sql`

### 2. API REST Backend (PHP)
1.  Navega a la carpeta del backend:
    ```bash
    cd backend
    ```
2.  Levanta el servidor local integrado de PHP en el puerto `8080`:
    ```bash
    php -S localhost:8080
    ```

### 3. Frontend SPA (Angular)
1.  Navega a la carpeta del frontend:
    ```bash
    cd frontend
    ```
2.  Instala las dependencias necesarias:
    ```bash
    npm install
    ```
3.  Levanta el servidor de desarrollo de Angular:
    ```bash
    ng serve
    ```
4.  Abre el navegador en `http://localhost:4200/`.

---

## 👥 Credenciales de Acceso para Pruebas

*   **Administrador**:
    *   **Correo**: `admin@crm.com`
    *   **Contraseña**: `admin123`
*   **Asesor de Ventas**:
    *   **Correo**: `juan.perez@example.com`
    *   **Contraseña**: `password123` *(o regístrate desde la pantalla protegida del administrador)*
