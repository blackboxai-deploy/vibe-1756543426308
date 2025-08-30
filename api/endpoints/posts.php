<?php
// Posts endpoints

/**
 * Get all posts (paginated)
 */
function getPosts() {
    $page = (int)($_GET['page'] ?? 1);
    $limit = (int)($_GET['limit'] ?? 20);
    $offset = ($page - 1) * $limit;
    
    $posts = readDataFile('posts.json');
    
    // Sort by creation date (newest first)
    usort($posts, function($a, $b) {
        return $b['created_at'] - $a['created_at'];
    });
    
    $total = count($posts);
    $paginatedPosts = array_slice($posts, $offset, $limit);
    
    // Get user data for non-anonymous posts
    $users = readDataFile('users.json');
    $userMap = [];
    foreach ($users as $user) {
        $userMap[$user['id']] = $user;
    }
    
    // Enrich posts with user data
    foreach ($paginatedPosts as &$post) {
        if ($post['user_id'] && isset($userMap[$post['user_id']])) {
            $user = $userMap[$post['user_id']];
            $post['author'] = [
                'username' => $user['username'],
                'display_name' => $user['display_name'],
                'instagram_handle' => $user['instagram_handle'],
                'telegram_handle' => $user['telegram_handle']
            ];
        }
    }
    
    echo json_encode([
        'posts' => $paginatedPosts,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

/**
 * Get single post
 */
function getPost($postId) {
    $posts = readDataFile('posts.json');
    $post = null;
    
    foreach ($posts as $p) {
        if ($p['id'] === (int)$postId) {
            $post = $p;
            break;
        }
    }
    
    if (!$post) {
        http_response_code(404);
        echo json_encode(['error' => 'Post not found']);
        return;
    }
    
    // Increment view count
    $post['views'] = ($post['views'] ?? 0) + 1;
    
    // Update post in storage
    foreach ($posts as &$p) {
        if ($p['id'] === $post['id']) {
            $p['views'] = $post['views'];
            break;
        }
    }
    writeDataFile('posts.json', $posts);
    
    // Get user data if not anonymous
    if ($post['user_id']) {
        $users = readDataFile('users.json');
        foreach ($users as $user) {
            if ($user['id'] === $post['user_id']) {
                $post['author'] = [
                    'username' => $user['username'],
                    'display_name' => $user['display_name'],
                    'instagram_handle' => $user['instagram_handle'],
                    'telegram_handle' => $user['telegram_handle']
                ];
                break;
            }
        }
    }
    
    echo json_encode($post);
}

/**
 * Create new post
 */
function createPost() {
    $currentUser = getCurrentUser();
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['title']) || !isset($input['file_path'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Title and file path required']);
        return;
    }
    
    $title = sanitizeInput($input['title']);
    $description = sanitizeInput($input['description'] ?? '');
    $filePath = sanitizeInput($input['file_path']);
    $fileType = sanitizeInput($input['file_type']);
    $anonymous = (bool)($input['anonymous'] ?? false);
    
    // Anonymous post data
    $authorName = sanitizeInput($input['author_name'] ?? '');
    $authorInstagram = sanitizeInput($input['author_instagram'] ?? '');
    $authorTelegram = sanitizeInput($input['author_telegram'] ?? '');
    $anonUsername = sanitizeInput($input['anon_username'] ?? '');
    
    // Validate file exists
    if (!file_exists(UPLOADS_DIR . '/' . $filePath)) {
        http_response_code(400);
        echo json_encode(['error' => 'File not found']);
        return;
    }
    
    $postId = getNextId('post');
    
    $newPost = [
        'id' => $postId,
        'user_id' => $anonymous ? null : ($currentUser['id'] ?? null),
        'title' => $title,
        'description' => $description,
        'file_path' => $filePath,
        'file_type' => $fileType,
        'anonymous' => $anonymous,
        'author_name' => $authorName,
        'author_instagram' => $authorInstagram,
        'author_telegram' => $authorTelegram,
        'anon_username' => $anonUsername,
        'views' => 0,
        'created_at' => time()
    ];
    
    $posts = readDataFile('posts.json');
    $posts[] = $newPost;
    writeDataFile('posts.json', $posts);
    
    // Set anonymous username cookie if posting anonymously with username
    if ($anonymous && $anonUsername) {
        setMatrixCookie('matrix_anon_username', $anonUsername, time() + ANONYMOUS_COOKIE_LIFETIME);
    }
    
    echo json_encode([
        'success' => true,
        'post_id' => $postId,
        'post' => $newPost
    ]);
}

/**
 * Handle file upload
 */
function handleFileUpload() {
    if (!isset($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No file uploaded']);
        return;
    }
    
    $file = $_FILES['file'];
    $validation = validateFileUpload($file);
    
    if (!$validation['valid']) {
        http_response_code(400);
        echo json_encode(['error' => $validation['error']]);
        return;
    }
    
    // Generate unique filename
    $extension = $validation['extension'];
    $filename = uniqid('matrix_', true) . '.' . $extension;
    $uploadPath = UPLOADS_DIR . '/' . $filename;
    
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save file']);
        return;
    }
    
    // Get file info
    $fileSize = filesize($uploadPath);
    $mimeType = getFileMimeType($filename);
    
    // Determine file type category
    $fileTypeCategory = 'unknown';
    if (strpos($mimeType, 'image/') === 0) {
        $fileTypeCategory = 'image';
    } elseif (strpos($mimeType, 'video/') === 0) {
        $fileTypeCategory = 'video';
    } elseif (strpos($mimeType, 'audio/') === 0) {
        $fileTypeCategory = 'audio';
    }
    
    echo json_encode([
        'success' => true,
        'file_path' => $filename,
        'file_type' => $fileTypeCategory,
        'file_size' => $fileSize,
        'mime_type' => $mimeType,
        'original_name' => $file['name']
    ]);
}
?>