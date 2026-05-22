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
    $query_count = "SELECT COUNT(*) as total FROM proformas";
    $stmt_count = $db->prepare($query_count);
    $stmt_count->execute();
    $cantidad_leads = (int)$stmt_count->fetch(PDO::FETCH_ASSOC)['total'];

    $query_facturado = "SELECT SUM(monto_total) as total FROM proformas WHERE estado = 'Ganado'";
    $stmt_facturado = $db->prepare($query_facturado);
    $stmt_facturado->execute();
    $total_facturado = (float)($stmt_facturado->fetch(PDO::FETCH_ASSOC)['total'] ?? 0.00);

    $query_negociacion = "SELECT SUM(monto_total) as total FROM proformas WHERE estado = 'Negociacion'";
    $stmt_negociacion = $db->prepare($query_negociacion);
    $stmt_negociacion->execute();
    $total_negociacion = (float)($stmt_negociacion->fetch(PDO::FETCH_ASSOC)['total'] ?? 0.00);

    $query_recent = "SELECT p.id, p.nombre_local, p.monto_total, p.estado, p.fecha_creacion,
                            CONCAT(u.nombres, ' ', u.apellidos) AS vendedor
                     FROM proformas p
                     INNER JOIN usuarios u ON p.usuario_id = u.id
                     ORDER BY p.fecha_creacion DESC LIMIT 5";
    $stmt_recent = $db->prepare($query_recent);
    $stmt_recent->execute();
    $recent_proformas = $stmt_recent->fetchAll(PDO::FETCH_ASSOC);
    foreach ($recent_proformas as &$item) {
        $item['id'] = (int)$item['id'];
        $item['monto_total'] = (float)$item['monto_total'];
    }

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "data" => [
            "total_facturado" => $total_facturado,
            "total_negociacion" => $total_negociacion,
            "cantidad_leads" => $cantidad_leads,
            "leads_recientes" => $recent_proformas
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error interno del servidor: " . $e->getMessage()]);
}
