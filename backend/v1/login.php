<?php
require_once '../config/database.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {

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
