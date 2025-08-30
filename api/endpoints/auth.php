<?php
// Authentication endpoints

/**
 * Check if username is available
 */
function checkUsername() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['username'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Username required']);
        return;
    }
    
    $username = sanitizeInput($input['username']);
    
    // Validate username
    if (strlen($username) < 3 || strlen($username) > 20) {
        echo json_encode(['available' => false, 'error' => 'Username must be 3-20 characters']);
        return;
    }
    
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        echo json_encode(['available' => false, 'error' => 'Username can only contain letters, numbers, and underscores']);
        return;
    }
    
    // Check if username exists
    $users = readDataFile('users.json');
    foreach ($users as $user) {
        if (strtolower($user['username']) === strtolower($username)) {
            echo json_encode(['available' => false, 'error' => 'Username already taken']);
            return;
        }
    }
    
    echo json_encode(['available' => true]);
}

/**
 * Register new user
 */
function handleRegister() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['username'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Username required']);
        return;
    }
    
    $username = sanitizeInput($input['username']);
    $displayName = sanitizeInput($input['display_name'] ?? '');
    $instagram = sanitizeInput($input['instagram'] ?? '');
    $telegram = sanitizeInput($input['telegram'] ?? '');
    
    // Validate username again
    $users = readDataFile('users.json');
    foreach ($users as $user) {
        if (strtolower($user['username']) === strtolower($username)) {
            http_response_code(400);
            echo json_encode(['error' => 'Username already taken']);
            return;
        }
    }
    
    // Generate Matrix password
    $matrixPassword = generateMatrixPassword($username);
    $passwordHash = password_hash($matrixPassword, PASSWORD_DEFAULT);
    
    // Create user
    $userId = getNextId('user');
    $newUser = [
        'id' => $userId,
        'username' => $username,
        'password_hash' => $passwordHash,
        'display_name' => $displayName,
        'instagram_handle' => $instagram,
        'telegram_handle' => $telegram,
        'created_at' => time(),
        'is_active' => true
    ];
    
    $users[] = $newUser;
    writeDataFile('users.json', $users);
    
    echo json_encode([
        'success' => true,
        'user_id' => $userId,
        'username' => $username,
        'matrix_password' => $matrixPassword
    ]);
}

/**
 * Login user
 */
function handleLogin() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['username']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Username and password required']);
        return;
    }
    
    $username = sanitizeInput($input['username']);
    $password = $input['password'];
    
    // Find user
    $users = readDataFile('users.json');
    $user = null;
    foreach ($users as $u) {
        if (strtolower($u['username']) === strtolower($username)) {
            $user = $u;
            break;
        }
    }
    
    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        return;
    }
    
    if (!$user['is_active']) {
        http_response_code(401);
        echo json_encode(['error' => 'Account inactive']);
        return;
    }
    
    // Create session
    $sessionToken = generateSessionToken();
    $sessions = readDataFile('sessions.json');
    
    // Clean expired sessions
    cleanExpiredSessions();
    
    $newSession = [
        'token' => $sessionToken,
        'user_id' => $user['id'],
        'created_at' => time(),
        'expires' => time() + SESSION_LIFETIME
    ];
    
    $sessions[] = $newSession;
    writeDataFile('sessions.json', $sessions);
    
    // Set session cookie
    setMatrixCookie('matrix_session', $sessionToken, time() + SESSION_LIFETIME);
    
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'display_name' => $user['display_name'],
            'instagram_handle' => $user['instagram_handle'],
            'telegram_handle' => $user['telegram_handle']
        ]
    ]);
}

/**
 * Logout user
 */
function handleLogout() {
    if (isset($_COOKIE['matrix_session'])) {
        // Remove session from storage
        $sessions = readDataFile('sessions.json');
        $sessions = array_filter($sessions, function($session) {
            return $session['token'] !== $_COOKIE['matrix_session'];
        });
        writeDataFile('sessions.json', array_values($sessions));
        
        // Clear session cookie
        setMatrixCookie('matrix_session', '', time() - 3600);
    }
    
    // Clear anonymous cookie if exists
    if (isset($_COOKIE['matrix_anon_username'])) {
        setMatrixCookie('matrix_anon_username', '', time() - 3600);
    }
    
    echo json_encode(['success' => true]);
}
?>