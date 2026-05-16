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
    echo json_encode(["status" => "error", "message" => "Error crítico: No se pudo conectar a la base de datos. Verifica tus credenciales en el archivo .env"]);
    exit;
}

if (!empty($data->email) && !empty($data->password)) {

    // 🛡️ Filtro de seguridad (Anti-SQL Injection) Backend
    $sqlPattern = '/(\'|"|;|--|\/\*|\*\/|\b(SELECT|UNION|INSERT|DELETE|UPDATE|DROP|ALTER|EXEC)\b)/i';
    if (preg_match($sqlPattern, $data->email) || preg_match($sqlPattern, $data->password)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Ese tipo de caracteres no son válidos por seguridad."]);
        exit;
    }

    $query = "SELECT id, nombre, password, rol_id FROM usuarios WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([trim($data->email)]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify(trim($data->password), trim($user['password']))) {
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "¡Bienvenido, " . $user['nombre'] . "!",
            "data" => ["id" => $user['id'], "rol_id" => $user['rol_id']]
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            "status" => "error",
            "message" => "Correo o contraseña incorrectos.",
            "debug_info" => (!$user) ? "El correo no existe en la DB" : "La contraseña no coincide con el hash"
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Datos incompletos."]);
}
