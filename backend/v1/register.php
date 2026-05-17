<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error de conexión a la base de datos."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (empty($data->name) || empty($data->email) || empty($data->password) || empty($data->rol_id)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Datos incompletos. Por favor, llena todos los campos."]);
    exit;
}

$nombre = trim($data->name);
$email = trim($data->email);
$password_hash = password_hash(trim($data->password), PASSWORD_BCRYPT);
$rol_id = (int)$data->rol_id;

$sqlPattern = '/(\'|"|;|--|\/\*|\*\/|\b(SELECT|UNION|INSERT|DELETE|UPDATE|DROP|ALTER|EXEC)\b)/i';
if (preg_match($sqlPattern, $nombre) || preg_match($sqlPattern, $email) || preg_match($sqlPattern, trim($data->password))) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Entrada maliciosa detectada."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "El formato del correo es inválido."]);
    exit;
}

try {
    $check_query = "SELECT id FROM usuarios WHERE email = :email";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(':email', $email);
    $check_stmt->execute();
    
    if ($check_stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["status" => "error", "message" => "El correo electrónico ya está registrado."]);
        exit;
    }
    
    $query = "INSERT INTO usuarios (nombre, email, password, rol_id) VALUES (:nombre, :email, :password, :rol_id)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':nombre', $nombre);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $password_hash);
    $stmt->bindParam(':rol_id', $rol_id);
    
    if ($stmt->execute()) {
        http_response_code(201);
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
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error interno del servidor."]);
}
