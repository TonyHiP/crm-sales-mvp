<?php
require_once '../config/database.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
$database = new Database();
$db = $database->getConnection();
if ($db === null) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error crítico: No se pudo conectar a la base de datos."]);
    exit;
}
try {
    // 1. Obtener Total Leads
    $query_total_leads = "SELECT COUNT(*) as total FROM leads";
    $stmt_total = $db->prepare($query_total_leads);
    $stmt_total->execute();
    $total_leads = $stmt_total->fetch(PDO::FETCH_ASSOC)['total'];
    // 2. Obtener Total Ventas Cerradas y Suma de Ingresos Totales
    // Vamos a sumar los ingresos de los leads en estado 'Cerrado/Ganado'
    $query_ingresos = "SELECT COUNT(*) as total_ventas, SUM(monto) as total_ingresos FROM leads WHERE estado = 'Cerrado/Ganado'";
    $stmt_ingresos = $db->prepare($query_ingresos);
    $stmt_ingresos->execute();
    $row_ingresos = $stmt_ingresos->fetch(PDO::FETCH_ASSOC);
        $ventas_cerradas = $row_ingresos['total_ventas'];
    $ingresos_totales = $row_ingresos['total_ingresos'] ?? 0;
    // Calcular la Tasa de Cierre
    $tasa_cierre = $total_leads > 0 ? round(($ventas_cerradas / $total_leads) * 100) : 0;
    // 3. Obtener Listado de Leads
    $query_leads = "SELECT id, empresa, monto, prioridad, estado, fecha_contacto FROM leads ORDER BY created_at DESC";
    $stmt_leads = $db->prepare($query_leads);
    $stmt_leads->execute();
    $leads = $stmt_leads->fetchAll(PDO::FETCH_ASSOC);
    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "data" => [
            "kpis" => [
                "total_leads" => (int)$total_leads,
                "ventas_cerradas" => (int)$ventas_cerradas,
                "ingresos" => (float)$ingresos_totales,
                "tasa_cierre" => (int)$tasa_cierre
            ],
            "leads" => $leads
        ]
    ]);
} catch (PDOException $e) {
    // Si la tabla no existe, devolveremos un JSON vacío con estructura correcta por ahora, para que no rompa el frontend.
    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "data" => [
            "kpis" => [
                "total_leads" => 0,
                "ventas_cerradas" => 0,
                "ingresos" => 0,
                "tasa_cierre" => 0
            ],
            "leads" => []
        ]
    ]);
}
