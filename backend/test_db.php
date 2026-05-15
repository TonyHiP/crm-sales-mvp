<?php
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($db) {
    echo "<h1>✅ Conexión Exitosa</h1>";
    echo "Estás conectado a: " . $db->query('SELECT version()')->fetchColumn();
} else {
    echo "<h1>❌ Error de Conexión</h1>";
}