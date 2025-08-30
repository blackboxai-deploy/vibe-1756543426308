<?php
// Database configuration (using JSON files for simplicity)
define('DATA_DIR', __DIR__ . '/data');
define('UPLOADS_DIR', __DIR__ . '/../public/uploads');

// Ensure data directories exist
if (!file_exists(DATA_DIR)) {
    mkdir(DATA_DIR, 0777, true);
}
if (!file_exists(UPLOADS_DIR)) {
    mkdir(UPLOADS_DIR, 0777, true);
}

// Cookie configuration
define('COOKIE_DOMAIN', '');
define('COOKIE_PATH', '/');
define('COOKIE_SECURE', false); // Set to true in production with HTTPS
define('COOKIE_HTTPONLY', true);
define('COOKIE_SAMESITE', 'Lax');

// Session configuration
define('SESSION_LIFETIME', 86400); // 24 hours
define('ANONYMOUS_COOKIE_LIFETIME', 2592000); // 30 days

// File upload configuration
define('MAX_FILE_SIZE', 50 * 1024 * 1024); // 50MB
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'mp3', 'wav', 'ogg']);

// Matrix password configuration
define('PASSWORD_LENGTH', 15);
define('PASSWORD_CHARS', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');

// Initialize data files if they don't exist
$dataFiles = [
    'users.json' => [],
    'posts.json' => [],
    'sessions.json' => [],
    'counters.json' => ['user_id' => 1, 'post_id' => 1]
];

foreach ($dataFiles as $file => $defaultData) {
    $filePath = DATA_DIR . '/' . $file;
    if (!file_exists($filePath)) {
        file_put_contents($filePath, json_encode($defaultData, JSON_PRETTY_PRINT));
    }
}
?>