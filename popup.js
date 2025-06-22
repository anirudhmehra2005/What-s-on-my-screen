// Popup script for What's On My Screen extension

document.addEventListener('DOMContentLoaded', function() {
  // Initialize popup
  loadApiKey();
  loadUsageStatus();
  
  // Set up event listeners
  document.getElementById('saveApiKey').addEventListener('click', saveApiKey);
  document.getElementById('apiKey').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      saveApiKey();
    }
  });
});

// Load saved API key
async function loadApiKey() {
  try {
    const result = await chrome.storage.local.get(['geminiApiKey']);
    if (result.geminiApiKey) {
      document.getElementById('apiKey').value = result.geminiApiKey;
      showStatusMessage('API key loaded successfully', 'success');
    }
  } catch (error) {
    console.error('Error loading API key:', error);
    showStatusMessage('Error loading API key', 'error');
  }
}

// Save API key
async function saveApiKey() {
  const apiKeyInput = document.getElementById('apiKey');
  const apiKey = apiKeyInput.value.trim();
  
  if (!apiKey) {
    showStatusMessage('Please enter an API key', 'error');
    return;
  }
  
  try {
    await chrome.storage.local.set({ geminiApiKey: apiKey });
    showStatusMessage('API key saved successfully!', 'success');
    
    // Clear the input for security
    apiKeyInput.value = '';
    
    // Reload usage status
    loadUsageStatus();
    
  } catch (error) {
    console.error('Error saving API key:', error);
    showStatusMessage('Error saving API key', 'error');
  }
}

// Load and display usage status
async function loadUsageStatus() {
  try {
    const result = await chrome.storage.local.get(['rateLimit']);
    const rateLimit = result.rateLimit || { count: 0, resetTime: Date.now() + (60 * 60 * 1000) };
    
    // Check if reset time has passed
    if (Date.now() > rateLimit.resetTime) {
      rateLimit.count = 0;
      rateLimit.resetTime = Date.now() + (60 * 60 * 1000);
      await chrome.storage.local.set({ rateLimit });
    }
    
    // Update display
    document.getElementById('requestCount').textContent = rateLimit.count;
    
    // Format reset time
    const resetDate = new Date(rateLimit.resetTime);
    const timeUntilReset = resetDate - Date.now();
    
    if (timeUntilReset > 0) {
      const minutes = Math.floor(timeUntilReset / (1000 * 60));
      const seconds = Math.floor((timeUntilReset % (1000 * 60)) / 1000);
      document.getElementById('resetTime').textContent = `${minutes}m ${seconds}s`;
    } else {
      document.getElementById('resetTime').textContent = 'Now';
    }
    
    // Update countdown every second
    if (timeUntilReset > 0) {
      setTimeout(loadUsageStatus, 1000);
    }
    
  } catch (error) {
    console.error('Error loading usage status:', error);
    document.getElementById('requestCount').textContent = 'Error';
    document.getElementById('resetTime').textContent = 'Error';
  }
}

// Show status message
function showStatusMessage(message, type = 'success') {
  const statusElement = document.getElementById('statusMessage');
  statusElement.textContent = message;
  statusElement.className = `status-message ${type}`;
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusElement.classList.add('hidden');
  }, 3000);
}

// Test API key functionality (optional)
async function testApiKey() {
  const result = await chrome.storage.local.get(['geminiApiKey']);
  const apiKey = result.geminiApiKey;
  
  if (!apiKey) {
    showStatusMessage('No API key configured', 'error');
    return;
  }
  
  try {
    // Send a test message to background script
    chrome.runtime.sendMessage({
      action: 'testApiKey',
      apiKey: apiKey
    }, (response) => {
      if (response && response.success) {
        showStatusMessage('API key is valid!', 'success');
      } else {
        showStatusMessage('Invalid API key', 'error');
      }
    });
  } catch (error) {
    showStatusMessage('Error testing API key', 'error');
  }
}

// Handle popup focus to refresh data
window.addEventListener('focus', function() {
  loadUsageStatus();
});

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.rateLimit) {
    loadUsageStatus();
  }
}); 