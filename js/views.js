// --- Core Load View Function ---

function loadView(file) {
  // Use the global 'app' variable, which is defined in apps.js
  const app = document.getElementById('app'); 
  if (!app) {
      console.error('SPA container element with id="app" not found.');
      return;
  }
    
  fetch('/' + file)
    .then(res => res.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // 1. Handle <link> and <style> tags from the view file's <head>
      const headNodes = doc.head ? Array.from(doc.head.querySelectorAll('link, style')) : [];
      headNodes.forEach(node => {
        if (node.tagName === 'LINK' && node.href) {
          if (!document.querySelector(`link[href="${node.href}"]`)) {
            const newLink = document.createElement('link');
            Array.from(node.attributes).forEach(a => newLink.setAttribute(a.name, a.value));
            document.head.appendChild(newLink);
          }
        } else if (node.tagName === 'STYLE') {
          const newStyle = document.createElement('style');
          newStyle.textContent = node.textContent;
          document.head.appendChild(newStyle);
        }
      });

      // 2. Remove script references from the body content before injecting
      const scripts = doc.body ? Array.from(doc.body.querySelectorAll('script')) : [];
      scripts.forEach(s => s.remove());

      // 3. Inject the content (from the view file's <body>) into the SPA container
      app.innerHTML = doc.body ? doc.body.innerHTML : '';

      // 4. Manually append and execute the scripts one by one
      scripts.forEach(s => {
        const newScript = document.createElement('script');
        if (s.src) {
          newScript.src = s.src;
          newScript.async = false;
        } else {
          newScript.textContent = s.textContent;
        }
        document.body.appendChild(newScript);
      });

      // 5. Handle the NexoraChat initialization if it exists
      if (window.NexoraChat && typeof window.NexoraChat.init === 'function') {
        try { window.NexoraChat.init(app); } catch (e) { /* ignore init errors */ }
      }
    })
    .catch(() => {
      app.innerHTML = `
        <h1 class="site-title">Error</h1>
        <p>Failed to load ${file}.</p>
      `;
    });
}


// --- Add Route-Specific Render Functions (using loadView) ---
// By defining them here, they are available when apps.js loads them into the 'routes' object.

function renderHome()        { loadView('index.html'); }
function renderProxy()       { loadView('proxy.html'); }
function renderChatbot()     { loadView('ai.html'); }
function renderGamesRoute()  { loadView('games.html'); }
function renderSettings()    { loadView('settings.html'); } //