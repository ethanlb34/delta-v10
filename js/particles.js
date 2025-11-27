(function() {
    function initParticles() {
        if (!document.getElementById('particles-js')) {
            var div = document.createElement('div');
            div.id = 'particles-js';
            div.style.position = 'fixed';
            div.style.top = '0';
            div.style.left = '0';
            div.style.width = '100%';
            div.style.height = '100%';
            div.style.zIndex = '0';
            div.style.pointerEvents = 'none';
            document.body.appendChild(div);
        }

        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js';
        script.onload = function() {
            particlesJS('particles-js', {
                particles: {
                    number: { value: 100 },
                    color: { value: '#5481CC' },
                    shape: { type: 'circle' },
                    opacity: { value: 0.2 },
                    size: { value: 5 },
                    move: { enable: true, speed: 0.5 },
                    line_linked: { enable: false }
                },
                interactivity: {
                    events: { onhover: { enable: true, mode: 'repulse' } }
                }
            });
        };
        document.head.appendChild(script);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initParticles);
    } else {
        initParticles();
    }
})();

// Function to dynamically load a CSS file
function loadFontAwesomeCSS() {
    // 1. Check if the stylesheet is already present to avoid duplicates
    const linkExists = document.querySelector('link[href*="font-awesome"]');
    if (linkExists) {
        console.log("Font Awesome CSS already loaded. Skipping.");
        return;
    }

    // 2. Create the <link> element
    const link = document.createElement('link');
    
    // 3. Set the necessary attributes
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    
    // 4. Append the <link> to the document <head>
    document.head.appendChild(link);
    console.log("Font Awesome CSS loaded dynamically.");
}

// 5. Call the function immediately, ideally before any Font Awesome icons are rendered.
loadFontAwesomeCSS();