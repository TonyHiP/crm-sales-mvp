<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

try {
    $query = "SELECT u.id, u.cedula, u.nombres, u.apellidos, u.email, u.celular, u.rol_id, u.activo, r.nombre AS rol_nombre 
              FROM usuarios u
              INNER JOIN roles r ON u.rol_id = r.id
              ORDER BY u.id ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($usuarios as &$user) {
        $user['id'] = (int)$user['id'];
        $user['rol_id'] = (int)$user['rol_id'];
        $user['activo'] = (int)$user['activo'];
    }

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "data" => $usuarios
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error interno del servidor: " . $e->getMessage()]);
}
