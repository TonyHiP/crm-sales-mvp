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
if (!empty($data->token) && !empty($data->password)) {
    // 🛡️ Filtro de seguridad (Anti-SQL Injection) Backend
    $sqlPattern = '/(\'|"|;|--|\/\*|\*\/|\b(SELECT|UNION|INSERT|DELETE|UPDATE|DROP|ALTER|EXEC)\b)/i';
    if (preg_match($sqlPattern, $data->password)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Ese tipo de caracteres no son válidos por seguridad."]);
        exit;
    }
    $token = trim($data->token);
    $password = trim($data->password);
    // Verificar si el token existe y no ha expirado
    $query = "SELECT id FROM usuarios WHERE reset_token = ? AND token_expires > NOW()";
    $stmt = $db->prepare($query);
    $stmt->execute([$token]);
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
                // Encriptar la nueva contraseña
        $password_hash = password_hash($password, PASSWORD_BCRYPT);
        // Actualizar la contraseña y limpiar el token y su expiración
        $update_query = "UPDATE usuarios SET password = ?, reset_token = NULL, token_expires = NULL WHERE id = ?";
        $update_stmt = $db->prepare($update_query);
                if ($update_stmt->execute([$password_hash, $user['id']])) {
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Contraseña actualizada exitosamente."
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Error al actualizar la contraseña."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "El enlace de recuperación es inválido o ha expirado."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Token o contraseña faltante."]);
}
