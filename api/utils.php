<?php
// Utility functions for the Matrix Art Platform

/**
 * Generate Matrix-style password
 */
function generateMatrixPassword($username) {
    $seed = crc32($username . time() . rand(1000, 9999));
    $password = '';
    
    for ($i = 0; $i < PASSWORD_LENGTH; $i++) {
        $index = abs($seed + $i * 7) % strlen(PASSWORD_CHARS);
        $password .= PASSWORD_CHARS[$index];
    }
    
    return $password;
}

/**
 * Read JSON data file
 */
function readDataFile($filename) {
    $filePath = DATA_DIR . '/' . $filename;
    if (!file_exists($filePath)) {
        return [];
    }
    $data = file_get_contents($filePath);
    return json_decode($data, true) ?: [];
}

/**
 * Write JSON data file
 */
function writeDataFile($filename, $data) {
    $filePath = DATA_DIR . '/' . $filename;
    return file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT));
}

/**
 * Generate unique session token
 */
function generateSessionToken() {
    return bin2hex(random_bytes(32));
}

/**
 * Get next ID counter
 */
function getNextId($type) {
    $counters = readDataFile('counters.json');
    $nextId = $counters[$type . '_id'] ?? 1;
    $counters[$type . '_id'] = $nextId + 1;
    writeDataFile('counters.json', $counters);
    return $nextId;
}

/**
 * Validate file upload
 */
function validateFileUpload($file) {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['valid' => false, 'error' => 'Upload error occurred'];
    }
    
    if ($file['size'] > MAX_FILE_SIZE) {
        return ['valid' => false, 'error' => 'File too large (max 50MB)'];
    }
    
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, ALLOWED_EXTENSIONS)) {
        return ['valid' => false, 'error' => 'Invalid file type'];
    }
    
    return ['valid' => true, 'extension' => $extension];
}

/**
 * Get file MIME type
 */
function getFileMimeType($filename) {
    $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    
    $mimeTypes = [
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg', 
        'png' => 'image/png',
        'gif' => 'image/gif',
        'mp4' => 'video/mp4',
        'webm' => 'video/webm',
        'mp3' => 'audio/mpeg',
        'wav' => 'audio/wav',
        'ogg' => 'audio/ogg'
    ];
    
    return $mimeTypes[$extension] ?? 'application/octet-stream';
}

/**
 * Set Matrix cookie
 */
function setMatrixCookie($name, $value, $expire = null) {
    if ($expire === null) {
        $expire = time() + SESSION_LIFETIME;
    }
    
    setcookie($name, $value, [
        'expires' => $expire,
        'path' => COOKIE_PATH,
        'domain' => COOKIE_DOMAIN,
        'secure' => COOKIE_SECURE,
        'httponly' => COOKIE_HTTPONLY,
        'samesite' => COOKIE_SAMESITE
    ]);
}

/**
 * Get current user from session/cookie
 */
function getCurrentUser() {
    // Check session cookie
    if (isset($_COOKIE['matrix_session'])) {
        $sessions = readDataFile('sessions.json');
        foreach ($sessions as $session) {
            if ($session['token'] === $_COOKIE['matrix_session'] && 
                $session['expires'] > time()) {
                
                $users = readDataFile('users.json');
                foreach ($users as $user) {
                    if ($user['id'] === $session['user_id']) {
                        return $user;
                    }
                }
            }
        }
    }
    
    // Check anonymous cookie
    if (isset($_COOKIE['matrix_anon_username'])) {
        return [
            'id' => null,
            'username' => $_COOKIE['matrix_anon_username'],
            'anonymous' => true
        ];
    }
    
    return null;
}

/**
 * Clean expired sessions
 */
function cleanExpiredSessions() {
    $sessions = readDataFile('sessions.json');
    $sessions = array_filter($sessions, function($session) {
        return $session['expires'] > time();
    });
    writeDataFile('sessions.json', array_values($sessions));
}

/**
 * Sanitize input
 */
function sanitizeInput($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}
?>