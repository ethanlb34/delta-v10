// js/chatbot.js - FINAL CORRECTED VERSION FOR SPA ROUTING

// 💥 CRITICAL FIX 1: Standard import for the Gemini SDK (now linked in index.html head)
import { GoogleGenAI } from 'https://cdn.jsdelivr.net/npm/@google/genai@1.21.0/dist/index.mjs';

// WARNING: In a real app, NEVER expose a real API key client-side.
// You must replace this with your actual key for the AI to work.
const GEMINI_API_KEY = "REMOVED"; 

// Global variables for AI client and history
let ai;
let generateContent;
const history = []; 
let listenersAttached = false;

// --- Helper Functions to Get Elements (must be run AFTER the AI page HTML is loaded) ---
function getElements() {
    return {
        promptInput: document.getElementById('prompt'),
        sendButton: document.getElementById('send'),
        chatScroll: document.getElementById('scroll'),
        introDiv: document.getElementById('intro') 
    };
}


// --- Message Display Function (Keeping your original logic) ---

/**
 * Creates and displays a chat message bubble.
 * @param {string} text The message content.
 * @param {'user' | 'gemini'} sender The message author.
 */
function displayMessage(text, sender) {
    const { chatScroll, introDiv } = getElements();
    if (!chatScroll) return;

    // 1. Create the new message bubble container
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('msg', sender === 'user' ? 'user' : 'model'); // Changed to 'msg' and 'model' for CSS

    // Hide the "What can I do for you?" intro once the first message is sent
    if (introDiv) {
        introDiv.style.display = 'none';
    }

    // 2. Process content
    if (sender === 'model') {
        // Use marked and DOMPurify for secure and robust markdown rendering
        const safeHtml = DOMPurify.sanitize(marked.parse(text));

        // Note: For advanced formatting like code blocks and MathJax, 
        // a more complex process using a library that supports those features 
        // with the SPA environment would be ideal.
        // We'll use the safe HTML output for now.
        messageContainer.innerHTML = safeHtml;
        
        // Post-processing for highlight.js and custom wrappers (based on your CSS)
        // This is complex, so for simplicity and to prioritize getting messages working, 
        // we'll rely on marked's standard output structure for now.
        
        // Simple code block logic from your original code (relying on pre-hljs to be loaded)
        // If your highlight.js integration works via marked, this is fine.
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        let finalHtml = '';
        let lastIndex = 0;
        let match;

        while ((match = codeBlockRegex.exec(text)) !== null) {
            let precedingText = text.substring(lastIndex, match.index).trim();
            if (precedingText) {
                 // Simple text to paragraph conversion
                 finalHtml += `<p>${precedingText.replace(/\n/g, '<br>')}</p>`;
            }

            const language = match[1] || 'plaintext';
            const code = match[2];

            // Use highlight.js to process the code
            const highlightedCode = hljs.highlight(code, {language: language}).value;

            // Create the code block structure
            finalHtml += `
                <div class="code-header">
                    <span>${language.toUpperCase()}</span>
                    <button class="copy-btn">Copy</button>
                </div>
                <pre><code class="language-${language}">${highlightedCode}</code></pre>
            `;
            lastIndex = codeBlockRegex.lastIndex;
        }

        let remainingText = text.substring(lastIndex).trim();
        if (remainingText) {
             finalHtml += `<p>${remainingText.replace(/\n/g, '<br>')}</p>`;
        }
        
        messageContainer.innerHTML = finalHtml;


    } else {
        // For user messages: keep it simple and safe
        const safeText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        messageContainer.innerHTML = `<p>${safeText.replace(/\n/g, '<br>')}</p>`;
    }

    // Append to the chat area and scroll to the bottom
    chatScroll.appendChild(messageContainer);
    chatScroll.scrollTop = chatScroll.scrollHeight;
}


// --- Main Send Logic (Remains the same) ---
async function sendMessage() {
    const { promptInput, sendButton, chatScroll } = getElements();
    const message = promptInput.value.trim();
    if (!message || !generateContent) return; // Stop if empty or AI not ready
    
    // 1. Display user message and clear input
    displayMessage(message, 'user');
    promptInput.value = '';

    // 2. Disable input/button and show a 'thinking' placeholder
    sendButton.disabled = true;
    promptInput.disabled = true;

    // Create a temporary placeholder (optional but good UX)
    const thinkingMessage = document.createElement('div');
    thinkingMessage.classList.add('msg', 'model', 'typing-indicator');
    thinkingMessage.innerHTML = '<span>Thinking...</span><div class="loader"></div><div class="loader"></div><div class="loader"></div>';
    chatScroll.appendChild(thinkingMessage);
    chatScroll.scrollTop = chatScroll.scrollHeight;

    // 3. Update history
    history.push({
        role: "user", 
        parts: [{ text: message }]
    });
    
    try {
        // 4. Call the Gemini API with the ENTIRE history
        const result = await generateContent({
            model: "gemini-2.5-flash",
            contents: history 
        }); 
        
        // 5. Cleanup placeholder and display response
        chatScroll.removeChild(thinkingMessage);
    
        const responseText = result.text.trim();
        displayMessage(responseText, 'model');

        // 6. Update history with the AI's response
        history.push({
            role: "model", 
            parts: [{ text: responseText }]
        });

    } catch (error) {
        console.error("Gemini API Error:", error);
        chatScroll.removeChild(thinkingMessage);
        
        // Remove the user message from history on failure to prevent stale context
        history.pop(); 
        
        // Display a simple error message
        displayMessage(`ERROR: I hit a brick wall! Please check the console for details.`, 'model');
    } finally {
        // 7. Re-enable input/button
        sendButton.disabled = false;
        promptInput.disabled = false;
        promptInput.focus();
    }
}


// --- Listener Attachment Logic ---
function attachListeners() {
    if (listenersAttached) return;
    
    const { promptInput, sendButton } = getElements();
    
    // Check if the elements exist before attaching listeners
    if (promptInput && sendButton) {
        
        // Send on button click
        sendButton.addEventListener('click', sendMessage);

        // Send on Enter, allow Shift+Enter for new line
        promptInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        });
        listenersAttached = true;
    }
}


// --- SPA Initialization Function ---

/**
 * 💥 CRITICAL FIX 2: Initializes the AI client and attaches listeners. 
 * Called by index.js router after HTML content is loaded.
 */
window.initChatbot = function() {
    // Initialize the AI client directly, as the SDK is now imported globally
    if (!ai) {
        try {
            ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
            // Get the models.generateContent function reference
            generateContent = ai.models.generateContent; 
            console.log("Gemini SDK Initialized.");
        } catch (e) {
            console.error("Failed to initialize GoogleGenAI SDK:", e);
            // If initialization fails, log the error and stop.
            return;
        }
    }
    
    // Attach listeners every time the page is loaded (they check if they are already attached)
    attachListeners();
    
    // Reset message alignment if needed
    const { chatScroll } = getElements();
    if (chatScroll) chatScroll.scrollTop = chatScroll.scrollHeight;
};
