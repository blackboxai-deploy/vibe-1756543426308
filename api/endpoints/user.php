<?php
// User endpoints

/**
 * Get user profile by username
 */
function getUserByUsername($username) {
    $users = readDataFile('users.json');
    $user = null;
    
    foreach ($users as $u) {
        if (strtolower($u['username']) === strtolower($username)) {
            $user = $u;
            break;
        }
    }
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        return;
    }
    
    // Get user's posts
    $posts = readDataFile('posts.json');
    $userPosts = array_filter($posts, function($post) use ($user) {
        return $post['user_id'] === $user['id'];
    });
    
    // Sort posts by creation date (newest first)
    usort($userPosts, function($a, $b) {
        return $b['created_at'] - $a['created_at'];
    });
    
    $publicUser = [
        'id' => $user['id'],
        'username' => $user['username'],
        'display_name' => $user['display_name'],
        'instagram_handle' => $user['instagram_handle'],
        'telegram_handle' => $user['telegram_handle'],
        'created_at' => $user['created_at'],
        'posts_count' => count($userPosts),
        'posts' => array_values($userPosts)
    ];
    
    echo json_encode($publicUser);
}

/**
 * Get current user's profile
 */
function getUserProfile() {
    $currentUser = getCurrentUser();
    
    if (!$currentUser || $currentUser['anonymous'] ?? false) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }
    
    // Get fresh user data
    $users = readDataFile('users.json');
    $user = null;
    foreach ($users as $u) {
        if ($u['id'] === $currentUser['id']) {
            $user = $u;
            break;
        }
    }
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        return;
    }
    
    // Get user's posts
    $posts = readDataFile('posts.json');
    $userPosts = array_filter($posts, function($post) use ($user) {
        return $post['user_id'] === $user['id'];
    });
    
    // Sort posts by creation date (newest first)
    usort($userPosts, function($a, $b) {
        return $b['created_at'] - $a['created_at'];
    });
    
    $profileData = [
        'id' => $user['id'],
        'username' => $user['username'],
        'display_name' => $user['display_name'],
        'instagram_handle' => $user['instagram_handle'],
        'telegram_handle' => $user['telegram_handle'],
        'created_at' => $user['created_at'],
        'posts_count' => count($userPosts),
        'posts' => array_values($userPosts)
    ];
    
    echo json_encode($profileData);
}

/**
 * Update user profile
 */
function updateUserProfile() {
    $currentUser = getCurrentUser();
    
    if (!$currentUser || $currentUser['anonymous'] ?? false) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON data']);
        return;
    }
    
    $users = readDataFile('users.json');
    $userIndex = -1;
    
    foreach ($users as $index => $user) {
        if ($user['id'] === $currentUser['id']) {
            $userIndex = $index;
            break;
        }
    }
    
    if ($userIndex === -1) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        return;
    }
    
    // Update allowed fields
    if (isset($input['display_name'])) {
        $users[$userIndex]['display_name'] = sanitizeInput($input['display_name']);
    }
    
    if (isset($input['instagram_handle'])) {
        $users[$userIndex]['instagram_handle'] = sanitizeInput($input['instagram_handle']);
    }
    
    if (isset($input['telegram_handle'])) {
        $users[$userIndex]['telegram_handle'] = sanitizeInput($input['telegram_handle']);
    }
    
    // Save updated user data
    writeDataFile('users.json', $users);
    
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $users[$userIndex]['id'],
            'username' => $users[$userIndex]['username'],
            'display_name' => $users[$userIndex]['display_name'],
            'instagram_handle' => $users[$userIndex]['instagram_handle'],
            'telegram_handle' => $users[$userIndex]['telegram_handle']
        ]
    ]);
}
?>