// js/chatbot.js - FINAL CORRECTED VERSION FOR SPA ROUTING

// 💥 CRITICAL FIX 1: Standard import for the Gemini SDK (now linked in index.html head)
import { GoogleGenAI } from 'https://cdn.jsdelivr.net/npm/@google/genai@1.21.0/dist/index.mjs';

// WARNING: In a real app, NEVER expose a real API key client-side.
// You must replace this with your actual key for the AI to work.
const GEMINI_API_KEY = "REMOVED"; 

// Global variables for AI client and history
let ai;
let generateContent;
let history = []; 
let listenersAttached = false;
let currentTopic = 'general';

// Topic configurations with system prompts
const topicConfigs = {
    'general': {
        name: 'General',
        systemPrompt: 'You are Delta AI, a helpful and friendly assistant. Answer questions on any topic clearly and concisely.'
    },
    'math': {
        name: 'Math',
        systemPrompt: 'You are Delta AI, a math tutor. Help users solve math problems step by step. Explain concepts clearly, show your work, and use proper mathematical notation when helpful.'
    },
    'reading': {
        name: 'Reading',
        systemPrompt: 'You are Delta AI, a reading comprehension assistant. Help users understand texts, analyze literature, identify themes, and improve their reading skills.'
    },
    'writing': {
        name: 'Writing',
        systemPrompt: 'You are Delta AI, a writing assistant. Help users improve their writing, provide feedback on grammar and style, suggest improvements, and help with essay structure and creative writing.'
    },
    'history': {
        name: 'History',
        systemPrompt: 'You are Delta AI, a history expert. Help users learn about historical events, figures, and time periods. Provide accurate historical context and explain cause-and-effect relationships.'
    },
    'science': {
        name: 'Science',
        systemPrompt: 'You are Delta AI, a science tutor. Explain scientific concepts clearly, help with biology, chemistry, physics, and other sciences. Use examples and analogies to make complex topics understandable.'
    },
    'coding': {
        name: 'Coding',
        systemPrompt: 'You are Delta AI, a programming assistant. Help users write code, debug issues, explain programming concepts, and provide code examples. Support multiple programming languages and best practices.'
    },
    'cooking': {
        name: 'Cooking',
        systemPrompt: 'You are Delta AI, a culinary assistant. Share recipes, cooking tips, ingredient substitutions, and help users learn cooking techniques. Be helpful with meal planning and dietary considerations.'
    },
    'language': {
        name: 'Language Learning',
        systemPrompt: 'You are Delta AI, a language learning assistant. Help users learn new languages, explain grammar rules, provide vocabulary, and offer practice exercises. Be encouraging and patient.'
    },
    'music': {
        name: 'Music',
        systemPrompt: 'You are Delta AI, a music assistant. Help users learn about music theory, instruments, genres, and famous musicians. Provide guidance on learning to play instruments and music composition.'
    },
    'art': {
        name: 'Art & Design',
        systemPrompt: 'You are Delta AI, an art and design assistant. Help users learn about art techniques, design principles, famous artists, and creative projects. Provide guidance on drawing, painting, and digital art.'
    }
};

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


// --- Topic Change Handler ---
window.handleTopicChange = function(topicId) {
    currentTopic = topicId;
    const config = topicConfigs[topicId] || topicConfigs['general'];
    
    // Update the topic hint text
    const topicHint = document.getElementById('topic-hint');
    if (topicHint) {
        topicHint.textContent = `Topic: ${config.name}`;
    }
    
    // Clear chat history when topic changes to start fresh with new context
    history = [];
    
    // Clear the chat scroll area
    const { chatScroll, introDiv } = getElements();
    if (chatScroll) {
        chatScroll.innerHTML = '';
    }
    
    // Show the intro again
    if (introDiv) {
        introDiv.style.display = 'block';
    }
    
    console.log(`Topic changed to: ${config.name}`);
};

// --- Main Send Logic ---
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

    // 3. Get the current topic's system prompt
    const topicConfig = topicConfigs[currentTopic] || topicConfigs['general'];
    
    // 4. Build contents with system instruction
    const systemInstruction = {
        role: "user",
        parts: [{ text: `[System Instruction: ${topicConfig.systemPrompt}]` }]
    };
    
    // Add user message to history
    history.push({
        role: "user", 
        parts: [{ text: message }]
    });
    
    // Build the full contents array with system prompt at the start
    const contents = history.length === 1 
        ? [systemInstruction, ...history]  // First message: include system prompt
        : history;  // Subsequent messages: system prompt already in context
    
    try {
        // 5. Call the Gemini API with the contents
        const result = await generateContent({
            model: "gemini-2.5-flash",
            contents: contents 
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
