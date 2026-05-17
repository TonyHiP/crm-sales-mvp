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
if (!empty($data->email)) {
    // 🛡️ Filtro de seguridad (Anti-SQL Injection) Backend
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
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        // Generar un token único
        $token = bin2hex(random_bytes(16));
        // Expiración de 15 minutos
        $expires = date('Y-m-d H:i:s', strtotime('+15 minutes'));
        $update_query = "UPDATE usuarios SET reset_token = ?, token_expires = ? WHERE id = ?";
        $update_stmt = $db->prepare($update_query);
        if ($update_stmt->execute([$token, $expires, $user['id']])) {
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Si el correo existe, se ha enviado un enlace de recuperación.",
                "token" => $token // Proveemos el token para simular el clic en el frontend (MVP Mode)
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Error interno al procesar la solicitud de recuperación."]);
        }
    } else {
        // Retornamos éxito de todas formas para no confirmar la existencia o no del correo (Seguridad anti-enumeración)
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Si el correo existe, se ha enviado un enlace de recuperación."
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "El correo electrónico es requerido."]);
}
