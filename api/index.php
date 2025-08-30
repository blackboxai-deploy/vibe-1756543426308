<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session
session_start();

// Include configuration and utilities
require_once 'config.php';
require_once 'utils.php';

// Route handling
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/api', '', $path);
$method = $_SERVER['REQUEST_METHOD'];

// API Routes
switch ($path) {
    case '/':
        handleRoot();
        break;
    case '/auth/register':
        if ($method === 'POST') {
            require_once 'endpoints/auth.php';
            handleRegister();
        }
        break;
    case '/auth/login':
        if ($method === 'POST') {
            require_once 'endpoints/auth.php';
            handleLogin();
        }
        break;
    case '/auth/logout':
        if ($method === 'POST') {
            require_once 'endpoints/auth.php';
            handleLogout();
        }
        break;
    case '/auth/check-username':
        if ($method === 'POST') {
            require_once 'endpoints/auth.php';
            checkUsername();
        }
        break;
    case '/posts':
        require_once 'endpoints/posts.php';
        if ($method === 'GET') {
            getPosts();
        } elseif ($method === 'POST') {
            createPost();
        }
        break;
    case '/posts/upload':
        if ($method === 'POST') {
            require_once 'endpoints/posts.php';
            handleFileUpload();
        }
        break;
    case '/user/profile':
        if ($method === 'GET') {
            require_once 'endpoints/user.php';
            getUserProfile();
        } elseif ($method === 'PUT') {
            require_once 'endpoints/user.php';
            updateUserProfile();
        }
        break;
    default:
        if (preg_match('/\/posts\/(\d+)/', $path, $matches)) {
            require_once 'endpoints/posts.php';
            getPost($matches[1]);
        } elseif (preg_match('/\/user\/(.+)/', $path, $matches)) {
            require_once 'endpoints/user.php';
            getUserByUsername($matches[1]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
        }
        break;
}

function handleRoot() {
    echo json_encode([
        'status' => 'online',
        'message' => 'Matrix Art Platform API v1.0',
        'endpoints' => [
            'auth' => '/auth/*',
            'posts' => '/posts/*',
            'user' => '/user/*'
        ]
    ]);
}
?>