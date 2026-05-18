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
if (preg_match($sqlPattern, $email) || preg_match($sqlPattern, $password)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Entrada maliciosa detectada."]);
    exit;
}

try {
    $query = "SELECT id, nombres, apellidos, password, rol_id FROM usuarios WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, trim($user['password']))) {
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "¡Bienvenido, " . $user['nombres'] . " " . $user['apellidos'] . "!",
            "data" => [
                "id" => $user['id'],
                "nombres" => $user['nombres'],
                "apellidos" => $user['apellidos'],
                "email" => $email,
                "rol_id" => (int)$user['rol_id']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            "status" => "error",
            "message" => "Correo o contraseña incorrectos."
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error interno del servidor."]);
}
