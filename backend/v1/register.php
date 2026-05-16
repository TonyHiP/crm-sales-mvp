<?php
require_once '../config/database.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));
if ($db === null) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error crítico: No se pudo conectar a la base de datos."]);
    exit;
}
if (!empty($data->name) && !empty($data->email) && !empty($data->password) && !empty($data->rol_id)) {
    // 🛡️ Filtro de seguridad (Anti-SQL Injection) Backend
    $sqlPattern = '/(\'|"|;|--|\/\*|\*\/|\b(SELECT|UNION|INSERT|DELETE|UPDATE|DROP|ALTER|EXEC)\b)/i';
    if (preg_match($sqlPattern, $data->name) || preg_match($sqlPattern, $data->email) || preg_match($sqlPattern, $data->password)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Ese tipo de caracteres no son válidos por seguridad."]);
        exit;
    }
    // Verificar si el correo ya existe
    $check_query = "SELECT id FROM usuarios WHERE email = ?";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->execute([trim($data->email)]);
    if ($check_stmt->rowCount() > 0) {
        http_response_code(409); // Conflict
        echo json_encode(["status" => "error", "message" => "El correo electrónico ya está registrado."]);
        exit;
    }
    // Insertar nuevo usuario
    $query = "INSERT INTO usuarios (nombre, email, password, rol_id) VALUES (?, ?, ?, ?)";
    $stmt = $db->prepare($query);
    $nombre = trim($data->name);
    $email = trim($data->email);
    // Encriptar la contraseña usando BCRYPT
    $password_hash = password_hash(trim($data->password), PASSWORD_BCRYPT);
    $rol_id = (int)$data->rol_id;
    if ($stmt->execute([$nombre, $email, $password_hash, $rol_id])) {
        http_response_code(201); // Created
        echo json_encode([
            "status" => "success",
            "message" => "Usuario registrado exitosamente."
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "No se pudo registrar el usuario."
        ]);
    }
} else {
    http_response_code(400); // Bad Request
    echo json_encode(["status" => "error", "message" => "Datos incompletos. Por favor, llena todos los campos."]);
}
