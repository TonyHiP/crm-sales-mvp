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

if (empty($data->cedula) || empty($data->nombres) || empty($data->apellidos) || empty($data->fecha_nacimiento) || empty($data->email) || empty($data->celular) || empty($data->password) || empty($data->rol_id)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Datos incompletos. Por favor, llena todos los campos."]);
    exit;
}

$cedula = trim($data->cedula);
$nombres = trim($data->nombres);
$apellidos = trim($data->apellidos);
$fecha_nacimiento = trim($data->fecha_nacimiento);
$email = trim($data->email);
$celular = trim($data->celular);
$password_raw = trim($data->password);
$rol_id = (int) $data->rol_id;

if (!preg_match('/^\d{10}$/', $cedula)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "La cédula debe contener exactamente 10 dígitos numéricos."]);
    exit;
}

if (!preg_match('/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/', $password_raw)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "La contraseña debe tener mínimo 8 caracteres, ser alfanumérica y contener al menos un carácter especial."]);
    exit;
}

$password_hash = password_hash($password_raw, PASSWORD_BCRYPT);

$sqlPattern = '/(\'|"|;|--|\/\*|\*\/|\b(SELECT|UNION|INSERT|DELETE|UPDATE|DROP|ALTER|EXEC)\b)/i';
if (preg_match($sqlPattern, $nombres) || preg_match($sqlPattern, $apellidos) || preg_match($sqlPattern, $email) || preg_match($sqlPattern, $password_raw)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Entrada maliciosa detectada."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "El formato del correo es inválido."]);
    exit;
}

try {
    $check_query = "SELECT email, cedula FROM usuarios WHERE email = :email OR cedula = :cedula";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(':email', $email);
    $check_stmt->bindParam(':cedula', $cedula);
    $check_stmt->execute();

    if ($check_stmt->rowCount() > 0) {
        $existing = $check_stmt->fetch(PDO::FETCH_ASSOC);
        http_response_code(409);
        if ($existing['email'] === $email) {
            echo json_encode(["status" => "error", "message" => "El correo electrónico ya está registrado."]);
        } else {
            echo json_encode(["status" => "error", "message" => "La cédula ya está registrada."]);
        }
        exit;
    }

    $query = "INSERT INTO usuarios (cedula, nombres, apellidos, fecha_nacimiento, email, celular, password, rol_id) VALUES (:cedula, :nombres, :apellidos, :fecha_nacimiento, :email, :celular, :password, :rol_id)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':cedula', $cedula);
    $stmt->bindParam(':nombres', $nombres);
    $stmt->bindParam(':apellidos', $apellidos);
    $stmt->bindParam(':fecha_nacimiento', $fecha_nacimiento);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':celular', $celular);
    $stmt->bindParam(':password', $password_hash);
    $stmt->bindParam(':rol_id', $rol_id);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode([
            "status" => "success",
            "message" => "Usuario registrado exitosamente."
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "No se pudo registrar el usuario."
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error interno del servidor."]);
}
