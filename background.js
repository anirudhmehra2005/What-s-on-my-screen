// Background service worker for What's On My Screen extension

// Rate limiting configuration
const RATE_LIMIT = {
  MAX_REQUESTS: 10,
  RESET_INTERVAL: 60 * 60 * 1000 // 1 hour in milliseconds
};

// TEMPORARY: Set API key on extension install (REMOVE BEFORE PUBLISHING)
chrome.runtime.onInstalled.addListener(() => {
    // Replace YOUR_API_KEY_HERE with your actual API key
    chrome.storage.local.set({
      geminiApiKey: 'AIzaSyBDycFzOpX8jA_COJIAj5bVvTohZHV6A3g'
    });
    
    chrome.contextMenus.create({
      id: "explainWithAI",
      title: "Explain with AI",
      contexts: ["selection"]
    });
  });

// Initialize context menu on extension install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "explainWithAI",
    title: "Explain with AI",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "explainWithAI" && info.selectionText) {
    handleTextAnalysis(info.selectionText, tab.id);
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeText") {
    handleTextAnalysis(request.text, sender.tab.id);
  }
});

// Main function to handle text analysis
async function handleTextAnalysis(selectedText, tabId) {
  try {
    // Check rate limiting
    const rateLimitStatus = await checkRateLimit();
    if (rateLimitStatus.isLimited) {
      showErrorPopup(tabId, `Rate limit exceeded. You can make ${RATE_LIMIT.MAX_REQUESTS} requests per hour.`);
      return;
    }

    // Show loading popup
    showLoadingPopup(tabId);

    // Call Gemini API
    const response = await callGeminiAPI(selectedText);
    
    if (response.error) {
      showErrorPopup(tabId, response.error);
    } else {
      showResponsePopup(tabId, response.analysis);
    }

    // Update rate limit
    await updateRateLimit();

  } catch (error) {
    console.error('Error in text analysis:', error);
    showErrorPopup(tabId, 'Failed to analyze text. Please try again.');
  }
}

// Call Google Gemini API with updated 2025 format
async function callGeminiAPI(text) {
  try {
    // Get API key from storage
    const result = await chrome.storage.local.get(['geminiApiKey']);
    const apiKey = result.geminiApiKey;
    
    if (!apiKey) {
      return { error: 'API key not configured. Please set your Gemini API key in the extension popup.' };
    }

    // Updated API endpoint and model name for 2025
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: `Analyze this text and provide a clear, helpful explanation. If it's a single word, provide a definition. If it's a technical paragraph, simplify it. If it's an error message, explain what it means and how to fix it. Keep the response concise and user-friendly.

Text to analyze: "${text}"`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 500
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error Response:', errorData);
      
      // Handle specific API errors
      if (errorData.error) {
        const errorCode = errorData.error.code;
        const errorMessage = errorData.error.message;
        
        switch (errorCode) {
          case 400:
            return { error: 'Invalid request. Please check your text selection.' };
          case 401:
            return { error: 'Invalid API key. Please check your Gemini API key.' };
          case 403:
            return { error: 'API key not authorized. Please check your API key permissions.' };
          case 429:
            return { error: 'API rate limit exceeded. Please try again later.' };
          case 500:
            return { error: 'Gemini API server error. Please try again.' };
          default:
            return { error: `API Error: ${errorMessage || 'Unknown error occurred'}` };
        }
      }
      
      return { error: `HTTP Error: ${response.status} - ${response.statusText}` };
    }

    const data = await response.json();
    console.log('Gemini API Response:', data);
    
    // Handle different response formats
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                    data.candidates?.[0]?.content?.text ||
                    data.text;
    
    if (!analysis) {
      console.error('No analysis in response:', data);
      return { error: 'No response received from AI service. Please try again.' };
    }

    return { analysis };

  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { error: 'Network error. Please check your internet connection.' };
    }
    
    return { error: `Request failed: ${error.message}` };
  }
}

// Rate limiting functions
async function checkRateLimit() {
  const result = await chrome.storage.local.get(['rateLimit']);
  const rateLimit = result.rateLimit || { count: 0, resetTime: Date.now() + RATE_LIMIT.RESET_INTERVAL };
  
  // Check if reset time has passed
  if (Date.now() > rateLimit.resetTime) {
    rateLimit.count = 0;
    rateLimit.resetTime = Date.now() + RATE_LIMIT.RESET_INTERVAL;
  }
  
  return {
    isLimited: rateLimit.count >= RATE_LIMIT.MAX_REQUESTS,
    remaining: Math.max(0, RATE_LIMIT.MAX_REQUESTS - rateLimit.count),
    resetTime: rateLimit.resetTime
  };
}

async function updateRateLimit() {
  const result = await chrome.storage.local.get(['rateLimit']);
  const rateLimit = result.rateLimit || { count: 0, resetTime: Date.now() + RATE_LIMIT.RESET_INTERVAL };
  
  // Check if reset time has passed
  if (Date.now() > rateLimit.resetTime) {
    rateLimit.count = 0;
    rateLimit.resetTime = Date.now() + RATE_LIMIT.RESET_INTERVAL;
  }
  
  rateLimit.count++;
  await chrome.storage.local.set({ rateLimit });
}

// Popup display functions
function showLoadingPopup(tabId) {
  chrome.tabs.sendMessage(tabId, {
    action: "showPopup",
    type: "loading",
    content: "Analyzing text with AI..."
  });
}

function showResponsePopup(tabId, content) {
  chrome.tabs.sendMessage(tabId, {
    action: "showPopup",
    type: "response",
    content: content
  });
}

function showErrorPopup(tabId, error) {
  chrome.tabs.sendMessage(tabId, {
    action: "showPopup",
    type: "error",
    content: error
  });
} 