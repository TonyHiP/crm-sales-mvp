<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error de conexión a la base de datos."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (empty($data->empresa) || !isset($data->monto) || empty($data->prioridad)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Datos incompletos."]);
    exit;
}

$empresa = trim($data->empresa);
$monto = floatval($data->monto);
$prioridad = trim($data->prioridad);
$estado = 'Prospección';

$sqlPattern = '/(\'|"|;|--|\/\*|\*\/|\b(SELECT|UNION|INSERT|DELETE|UPDATE|DROP|ALTER|EXEC)\b)/i';
if (preg_match($sqlPattern, $empresa) || preg_match($sqlPattern, $data->monto)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Entrada maliciosa detectada."]);
    exit;
}

try {
    $query = "INSERT INTO leads (empresa, monto, prioridad, estado, fecha_contacto) VALUES (:empresa, :monto, :prioridad, :estado, NOW())";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':empresa', $empresa);
    $stmt->bindParam(':monto', $monto);
    $stmt->bindParam(':prioridad', $prioridad);
    $stmt->bindParam(':estado', $estado);
    
    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["status" => "success", "message" => "Lead creado exitosamente."]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Error al guardar el lead."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error interno del servidor."]);
}
