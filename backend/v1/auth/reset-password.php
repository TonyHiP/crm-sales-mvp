<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../config/database.php';
$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error de conexión a la base de datos."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (empty($data->email) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Datos incompletos."]);
    exit;
}

$email = trim($data->email);
$password = trim($data->password);

$sqlPattern = '/(\'|"|;|--|\/\*|\*\/|\b(SELECT|UNION|INSERT|DELETE|UPDATE|DROP|ALTER|EXEC)\b)/i';
if (preg_match($sqlPattern, $email) || preg_match($sqlPattern, $password) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "El formato del correo es inválido o contiene caracteres prohibidos."]);
    exit;
}

try {
    $query = "SELECT id FROM usuarios WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "El correo electrónico no se encuentra registrado."]);
        exit;
    }
    
    $newPasswordHash = password_hash($password, PASSWORD_BCRYPT);
    
    $updateQuery = "UPDATE usuarios SET password = :password WHERE email = :email";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(':password', $newPasswordHash);
    $updateStmt->bindParam(':email', $email);
    
    if ($updateStmt->execute()) {
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Contraseña actualizada correctamente."]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "No se pudo actualizar la contraseña."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error interno del servidor."]);
}
