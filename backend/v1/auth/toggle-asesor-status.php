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

if (!isset($data->id) || !isset($data->activo)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Datos incompletos. Se requiere 'id' y 'activo'."]);
    exit;
}

$id = intval($data->id);
$activo = intval($data->activo) === 1 ? 1 : 0;

try {
    $query = "UPDATE usuarios SET activo = :activo WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':activo', $activo, PDO::PARAM_INT);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    
    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Estado del asesor actualizado exitosamente.",
            "data" => [
                "id" => $id,
                "activo" => $activo
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "No se pudo actualizar el estado del asesor."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error interno del servidor: " . $e->getMessage()]);
}
