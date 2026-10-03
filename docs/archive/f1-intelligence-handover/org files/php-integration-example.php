<?php
/**
 * F1 Intelligence Integration for Paddock Picks
 * 
 * This class provides F1 racing insights to help users make better predictions
 * by querying the RAG system.
 */

class F1Intelligence {
    private string $apiUrl;
    private int $timeout;
    
    public function __construct(string $apiUrl = 'http://localhost:3001', int $timeout = 10) {
        $this->apiUrl = rtrim($apiUrl, '/');
        $this->timeout = $timeout;
    }
    
    /**
     * Query the F1 Intelligence RAG system
     * 
     * @param string $question The user's question
     * @return array{answer: string, sources: array}|null
     */
    public function query(string $question): ?array {
        $ch = curl_init();
        
        curl_setopt_array($ch, [
            CURLOPT_URL => $this->apiUrl . '/api/f1-intelligence',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode(['question' => $question]),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
            ],
            CURLOPT_TIMEOUT => $this->timeout,
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        curl_close($ch);
        
        if ($httpCode !== 200) {
            error_log("F1 Intelligence API error: HTTP $httpCode");
            return null;
        }
        
        $data = json_decode($response, true);
        
        if (!$data || !isset($data['answer'])) {
            error_log("F1 Intelligence API: Invalid response format");
            return null;
        }
        
        return $data;
    }
    
    /**
     * Check if the API is available
     */
    public function healthCheck(): bool {
        $ch = curl_init();
        
        curl_setopt_array($ch, [
            CURLOPT_URL => $this->apiUrl . '/api/health',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 3,
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        curl_close($ch);
        
        return $httpCode === 200;
    }
}

// Example usage in Paddock Picks

/**
 * Example 1: Add an "Ask F1 Intelligence" feature to the race prediction page
 */
function handleIntelligenceQuery() {
    // This would be called via AJAX from the frontend
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        exit;
    }
    
    $question = $_POST['question'] ?? '';
    
    if (empty($question)) {
        http_response_code(400);
        echo json_encode(['error' => 'Question is required']);
        exit;
    }
    
    $intelligence = new F1Intelligence();
    $result = $intelligence->query($question);
    
    if ($result === null) {
        http_response_code(503);
        echo json_encode(['error' => 'F1 Intelligence service unavailable']);
        exit;
    }
    
    header('Content-Type: application/json');
    echo json_encode($result);
}

/**
 * Example 2: Provide context-aware tips on the prediction form
 */
function getCircuitInsights(string $circuitName, string $driver): ?string {
    $intelligence = new F1Intelligence();
    
    $question = "How has $driver performed at $circuitName historically? What should I know for making a podium prediction?";
    
    $result = $intelligence->query($question);
    
    return $result ? $result['answer'] : null;
}

/**
 * Example 3: Generate pre-race analysis
 */
function generatePreRaceAnalysis(string $raceName): ?array {
    $intelligence = new F1Intelligence();
    
    $questions = [
        "What are the key statistics for $raceName?",
        "What's the average finishing position for pole sitters at $raceName?",
        "What weather conditions should I expect at $raceName?"
    ];
    
    $insights = [];
    
    foreach ($questions as $question) {
        $result = $intelligence->query($question);
        if ($result) {
            $insights[] = [
                'question' => $question,
                'answer' => $result['answer'],
                'sources' => $result['sources']
            ];
        }
    }
    
    return $insights;
}

/**
 * Example 4: Use in API endpoint for mobile app
 */
if (isset($_GET['endpoint']) && $_GET['endpoint'] === 'f1-intelligence') {
    handleIntelligenceQuery();
}
