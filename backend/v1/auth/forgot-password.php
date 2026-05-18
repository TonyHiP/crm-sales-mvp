<?php
require_once '../../config/database.php';
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
if (!empty($data->email)) {
    
    $sqlPattern = '/(\'|"|;|--|\/\*|\*\/|\b(SELECT|UNION|INSERT|DELETE|UPDATE|DROP|ALTER|EXEC)\b)/i';
    if (preg_match($sqlPattern, $data->email)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Ese tipo de caracteres no son válidos por seguridad."]);
        exit;
    }
    $email = trim($data->email);
    $query = "SELECT id FROM usuarios WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$email]);
    if ($stmt->rowCount() > 0) {
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Correo verificado correctamente."
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "El correo electrónico no se encuentra registrado."
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "El correo electrónico es requerido."]);
}
