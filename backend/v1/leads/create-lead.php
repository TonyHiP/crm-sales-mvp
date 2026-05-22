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

$raw_input = file_get_contents("php://input");

error_log("[DEBUG create-lead.php] Recibido: " . $raw_input);

$data = json_decode($raw_input);

if ($data === null) {
    http_response_code(400);
    echo json_encode([
        "status" => "error", 
        "message" => "JSON inválido o cuerpo vacío recibido.",
        "raw_received" => $raw_input
    ]);
    exit;
}

if (empty($data->nombre_local) || !isset($data->monto_total) || empty($data->detalle_componentes)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Datos incompletos. Se requiere: nombre_local, monto_total y detalle_componentes."]);
    exit;
}

$usuario_id = isset($data->usuario_id) && intval($data->usuario_id) > 0 ? intval($data->usuario_id) : 1;
$nombre_local = trim($data->nombre_local);
$monto_total = floatval($data->monto_total);
$detalle_componentes = trim($data->detalle_componentes);
$estado = !empty($data->estado) ? trim($data->estado) : 'Prospeccion';

$estados_validos = ['Prospeccion', 'Negociacion', 'Ganado'];
if (!in_array($estado, $estados_validos)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Estado no válido."]);
    exit;
}

try {
    $query = "INSERT INTO proformas (usuario_id, nombre_local, monto_total, detalle_componentes, estado) 
              VALUES (:usuario_id, :nombre_local, :monto_total, :detalle_componentes, :estado)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
    $stmt->bindParam(':nombre_local', $nombre_local, PDO::PARAM_STR);
    $stmt->bindParam(':monto_total', $monto_total);
    $stmt->bindParam(':detalle_componentes', $detalle_componentes, PDO::PARAM_STR);
    $stmt->bindParam(':estado', $estado, PDO::PARAM_STR);
    
    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode([
            "status" => "success",
            "message" => "Proforma creada exitosamente.",
            "data" => [
                "id" => $db->lastInsertId(),
                "usuario_id" => $usuario_id,
                "nombre_local" => $nombre_local,
                "monto_total" => $monto_total,
                "detalle_componentes" => $detalle_componentes,
                "estado" => $estado
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Error al guardar la proforma."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error interno del servidor: " . $e->getMessage()]);
}
