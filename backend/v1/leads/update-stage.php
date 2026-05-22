<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, PUT, OPTIONS");
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

$id = !empty($data->id) ? intval($data->id) : 0;
$estado = !empty($data->nuevo_estado) ? trim($data->nuevo_estado) : (!empty($data->estado) ? trim($data->estado) : '');

if (empty($id) || empty($estado)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Datos incompletos. Se requiere 'id' y 'nuevo_estado'."]);
    exit;
}

$estados_validos = ['Prospeccion', 'Negociacion', 'Ganado'];
if (!in_array($estado, $estados_validos)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Estado no válido. Valores permitidos: Prospeccion, Negociacion, Ganado."]);
    exit;
}

try {
    $query = "UPDATE proformas SET estado = :estado WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':estado', $estado, PDO::PARAM_STR);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    
    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Estado de la proforma actualizado exitosamente.",
                "data" => [
                    "id" => $id,
                    "estado" => $estado
                ]
            ]);
        } else {
            $checkQuery = "SELECT id FROM proformas WHERE id = :id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(':id', $id, PDO::PARAM_INT);
            $checkStmt->execute();
            if ($checkStmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Proforma no encontrada."]);
            } else {
                http_response_code(200);
                echo json_encode([
                    "status" => "success",
                    "message" => "El estado ya era el solicitado. No hubo cambios.",
                    "data" => [
                        "id" => $id,
                        "estado" => $estado
                    ]
                ]);
            }
        }
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Error al actualizar el estado."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error interno del servidor: " . $e->getMessage()]);
}
