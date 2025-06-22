// Content script for What's On My Screen extension

let currentPopup = null;
let selectedText = '';

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showPopup") {
    showPopup(request.type, request.content);
  }
});

// Handle text selection
document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('keyup', handleTextSelection);

function handleTextSelection(event) {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  // Clear existing popup if no text is selected
  if (!selectedText) {
    hidePopup();
    return;
  }
  
  // Store selected text for potential use
  window.selectedText = selectedText;
}

// Show popup with AI response
function showPopup(type, content) {
  // Hide existing popup
  hidePopup();
  
  // Get selection position
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  // Create popup element
  const popup = document.createElement('div');
  popup.id = 'whats-on-my-screen-popup';
  popup.className = `woms-popup woms-popup-${type}`;
  
  // Position popup near selected text
  const popupContent = createPopupContent(type, content);
  popup.innerHTML = popupContent;
  
  // Add to page
  document.body.appendChild(popup);
  
  // Position popup
  positionPopup(popup, rect);
  
  // Store reference
  currentPopup = popup;
  
  // Auto-hide after 10 seconds for response popups
  if (type === 'response') {
    setTimeout(() => {
      hidePopup();
    }, 10000);
  }
}

// Create popup content based on type
function createPopupContent(type, content) {
  const closeButton = '<button class="woms-close-btn" onclick="this.parentElement.remove()">×</button>';
  
  switch (type) {
    case 'loading':
      return `
        <div class="woms-header">
          <span class="woms-title">Analyzing...</span>
          ${closeButton}
        </div>
        <div class="woms-content">
          <div class="woms-loading">
            <div class="woms-spinner"></div>
            <p>${content}</p>
          </div>
        </div>
      `;
      
    case 'response':
      return `
        <div class="woms-header">
          <span class="woms-title">AI Explanation</span>
          ${closeButton}
        </div>
        <div class="woms-content">
          <div class="woms-response">
            ${formatResponse(content)}
          </div>
        </div>
      `;
      
    case 'error':
      return `
        <div class="woms-header woms-error-header">
          <span class="woms-title">Error</span>
          ${closeButton}
        </div>
        <div class="woms-content">
          <div class="woms-error">
            <p>${content}</p>
          </div>
        </div>
      `;
      
    default:
      return `
        <div class="woms-header">
          <span class="woms-title">What's On My Screen</span>
          ${closeButton}
        </div>
        <div class="woms-content">
          <p>${content}</p>
        </div>
      `;
  }
}

// Format response text with proper line breaks
function formatResponse(text) {
  return text
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

// Position popup near selected text
function positionPopup(popup, selectionRect) {
  const popupRect = popup.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Calculate initial position (10px offset from selection)
  let left = selectionRect.left + window.scrollX;
  let top = selectionRect.bottom + window.scrollY + 10;
  
  // Adjust horizontal position to keep popup in viewport
  if (left + popupRect.width > viewportWidth + window.scrollX) {
    left = viewportWidth + window.scrollX - popupRect.width - 10;
  }
  if (left < window.scrollX) {
    left = window.scrollX + 10;
  }
  
  // Adjust vertical position to keep popup in viewport
  if (top + popupRect.height > viewportHeight + window.scrollY) {
    // Try positioning above the selection
    top = selectionRect.top + window.scrollY - popupRect.height - 10;
    
    // If still not visible, position at top of viewport
    if (top < window.scrollY) {
      top = window.scrollY + 10;
    }
  }
  
  // Apply position
  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
}

// Hide popup
function hidePopup() {
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }
}

// Close popup when clicking outside
document.addEventListener('click', (event) => {
  if (currentPopup && !currentPopup.contains(event.target)) {
    hidePopup();
  }
});

// Close popup on escape key
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && currentPopup) {
    hidePopup();
  }
});

// Handle page scroll to reposition popup
let scrollTimeout;
window.addEventListener('scroll', () => {
  if (currentPopup) {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      hidePopup();
    }, 100);
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  if (currentPopup) {
    hidePopup();
  }
}); 