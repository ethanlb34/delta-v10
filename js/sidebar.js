// 1. PROXY DATA
const PROXY_LIST = [
    { name: 'JMW', url: 'https://woqrv96.beanweb.qzz.io.cdn.cloudflare.net/active/' },
    { name: 'Velara', url: 'https://zearn.buzz.cdn.cloudflare.net/' },
    { name: 'Truffled', url: 'https://educational.mom.cdn.cloudflare.net/' }
];

document.addEventListener('DOMContentLoaded', () => {
    // Check for SPA routing functions
    if (typeof window.route !== 'function') {
        console.error("SPA routing function 'route(event)' is not defined. Ensure the main index.html script is loaded first.");
    }
    // 2. UPDATED SIDEBAR HTML 
    const sidebarHtml = `
<aside id="main-sidebar" class="sidebar-nav fixed left-0 top-0 h-full bg-dark-surface border-r border-baby-blue/30 flex flex-col py-6 z-50 overflow-hidden">
    <div id="mouse-highlight-follower" class="absolute w-20 h-20 rounded-full bg-baby-blue/10 blur-xl pointer-events-none" style="opacity: 0; transition: opacity 0.2s ease-out;"></div>
    <a href="/" onclick="route(event)" class="flex items-center w-full px-4 mb-10 h-16 relative z-10">
        <img id="sidebar-logo" src="/static/favicons/deltav10.png" alt="Delta V10 Logo" class="w-11 h-11 rounded-lg shrink-0">
        <span class="nav-label text-2xl font-extrabold ml-4 sidebar-logo-text">Delta V10</span>
    </a>
    <nav class="flex flex-col flex-grow space-y-3 w-full px-3 relative z-10">
        <a href="/index" onclick="route(event)" title="Home" class="sidebar-link flex items-center py-3.5 px-3 rounded-xl text-baby-blue hover:bg-baby-blue/10 transition duration-200 font-semibold">
            <i class="fas fa-home w-6 h-6 shrink-0"></i>
            <span class="nav-label text-base font-medium">Home</span>
        </a>
        <a href="/games" onclick="route(event)" title="Games" class="sidebar-link flex items-center py-3.5 px-3 rounded-xl text-gray-300 hover:text-baby-blue hover:bg-baby-blue/10 transition duration-200">
            <i class="fas fa-gamepad w-6 h-6 shrink-0"></i>
            <span class="nav-label text-base font-medium">Games</span>
        </a>
        <a href="/ai" onclick="route(event)" title="AI Assistant" class="sidebar-link flex items-center py-3.5 px-3 rounded-xl text-gray-300 hover:text-baby-blue hover:bg-baby-blue/10 transition duration-200">
            <i class="fas fa-robot w-6 h-6 shrink-0"></i>
            <span class="nav-label text-base font-medium">AI Assistant</span>
        </a>
        <a href="/chat" onclick="route(event)" title="Chat" id="chat-sidebar-link" class="sidebar-link flex items-center py-3.5 px-3 rounded-xl text-gray-300 hover:text-baby-blue hover:bg-baby-blue/10 transition duration-200">
            <div class="relative w-6 h-6 shrink-0">
                <i class="fas fa-comment w-full h-full"></i>
                <span id="chat-notification-badge" class="absolute bottom-0 left-0 w-5 h-5 bg-red-600 rounded-full text-xs font-bold flex items-center justify-center text-white ring-2 ring-dark-surface hidden" style="transform: translate(-35%, 35%);">0</span>
            </div>
            <span class="nav-label text-base font-medium">Chat</span>
        </a>
        <a href="/movies" onclick="route(event)" title="Movies" class="sidebar-link flex items-center py-3.5 px-3 rounded-xl text-gray-300 hover:text-baby-blue hover:bg-baby-blue/10 transition duration-200">
            <i class="fas fa-video w-6 h-6 shrink-0"></i> <span class="nav-label text-base font-medium">Movies</span>
        </a>
        <div class="relative w-full" id="proxy-container">
            <button id="proxy-dropdown-toggle" title="Proxy" class="sidebar-link flex items-center justify-start w-full py-3.5 px-3 rounded-xl text-gray-300 hover:text-baby-blue hover:bg-baby-blue/10 transition duration-200 focus:outline-none">
                <i class="fas fa-globe w-6 h-6 shrink-0"></i>
                <span class="nav-label text-base font-medium">Proxy</span>
            </button>
            <div id="proxy-dropdown-list" class="mt-1 transition-all ease-in-out duration-300 max-h-0 overflow-hidden bg-dark-surface/50 rounded-xl">
            </div>
        </div>
        <div class="flex-grow"></div>
        <a href="/help" onclick="route(event)" title="Help" class="sidebar-link flex items-center py-3.5 px-3 rounded-xl text-gray-300 hover:text-baby-blue hover:bg-baby-blue/10 transition duration-200">
            <i class="fas fa-newspaper w-6 h-6 shrink-0"></i> <span class="nav-label text-base font-medium">Help</span>
        </a>
        <a href="/settings" onclick="route(event)" title="Settings" class="sidebar-link flex items-center py-3.5 px-3 rounded-xl text-gray-300 hover:text-baby-blue hover:bg-baby-blue/10 transition duration-200">
            <i class="fas fa-cog w-6 h-6 shrink-0"></i>
            <span class="nav-label text-base font-medium">Settings</span>
        </a>
    </nav>
</aside>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', sidebarHtml);
    
    if (window.applyCurrentTheme) {
        window.applyCurrentTheme();
    }
    
    const currentPath = window.location.pathname;
    const proxyToggleBtn = document.getElementById('proxy-dropdown-toggle');
    const proxyListContainer = document.getElementById('proxy-dropdown-list');

    // Define the full set of active classes
    const FULL_ACTIVE_CLASSES = ['text-baby-blue', 'neon-element', 'border-none', 'shadow-neon-sm', 'font-semibold'];
    const MINIMAL_ACTIVE_CLASSES = ['text-baby-blue', 'font-semibold'];

    // Deactivate all links/buttons initially
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove(...FULL_ACTIVE_CLASSES);
        link.classList.add('text-gray-300'); 

        const linkPath = link.getAttribute('href');
        if (link.tagName === 'A' && (linkPath === currentPath || (currentPath === '/' && linkPath === '/index'))) {
            link.classList.add(...MINIMAL_ACTIVE_CLASSES);
            link.classList.remove('text-gray-300');
        }
    });

    // Handle activation for the Proxy button if on the /proxy route
    if (proxyToggleBtn && currentPath === '/proxy') {
        proxyToggleBtn.classList.add(...MINIMAL_ACTIVE_CLASSES);
        proxyToggleBtn.classList.remove('text-gray-300');
    }

    const loadProxy = (url) => {
        window.history.pushState({}, '', '/proxy'); 
        
        if (typeof window.loadPage === 'function') {
            window.loadPage(); 
        } else if (typeof window.route === 'function') {
            window.route(new Event('click'));
        }
        
        setTimeout(() => {
            _updateProxyIframe(url);
        }, 50);
    };

    const _updateProxyIframe = (url) => {
        const iframe = document.getElementById('proxy-iframe');
        const message = document.getElementById('proxy-default-message');

        if (iframe) {
            iframe.src = url;
            iframe.classList.remove('hidden');
            if (message) message.classList.add('hidden');
            
            if (proxyToggleBtn) {
                document.querySelectorAll('.sidebar-link').forEach(link => {
                    link.classList.remove(...FULL_ACTIVE_CLASSES, ...MINIMAL_ACTIVE_CLASSES);
                    link.classList.add('text-gray-300');
                });
                proxyToggleBtn.classList.add(...MINIMAL_ACTIVE_CLASSES);
            }
        } else {
            console.warn("Proxy iframe or content area not found. Is index.html loading correctly?");
        }
    }

    // Populate the dropdown list
    PROXY_LIST.forEach(proxy => {
        const listItem = document.createElement('a');
        listItem.href = `#/proxy/${proxy.name.toLowerCase().replace(/\s/g, '-')}`; 
        listItem.className = 'proxy-list-item pl-10 pr-3 py-2 text-sm text-gray-400 hover:text-baby-blue hover:bg-baby-blue/10 transition duration-150 block';
        listItem.textContent = proxy.name;
        
        listItem.onclick = (e) => {
            e.preventDefault();
            loadProxy(proxy.url);
            closeDropdown(); 
        };
        proxyListContainer.appendChild(listItem);
    });

    // Add click functionality to toggle dropdown
    proxyToggleBtn.addEventListener('click', () => {
        if (proxyListContainer.classList.contains('max-h-0')) {
            proxyListContainer.classList.remove('max-h-0');
            proxyListContainer.classList.add('max-h-full');
            proxyToggleBtn.classList.remove('text-gray-300');
            proxyToggleBtn.classList.add('text-baby-blue', 'font-semibold');
        } else {
            closeDropdown(); 
        }
    });

    const closeDropdown = () => {
        proxyListContainer.classList.remove('max-h-full');
        proxyListContainer.classList.add('max-h-0');
        
        if (window.location.pathname !== '/proxy') {
            proxyToggleBtn.classList.remove('text-baby-blue', 'font-semibold');
            proxyToggleBtn.classList.add('text-gray-300');
        }
    }

    // Mouse highlight follower logic (unmodified)
    const sidebar = document.getElementById('main-sidebar');
    const follower = document.getElementById('mouse-highlight-follower');

    const MANUAL_X_CORRECTION = -68; 
    const MANUAL_Y_CORRECTION = -20.5; 

    if (sidebar && follower) {
        sidebar.addEventListener('mousemove', (e) => {
            const rect = sidebar.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.clientY; 
            
            const adjustedX = mouseX + MANUAL_X_CORRECTION;
            const adjustedY = mouseY + MANUAL_Y_CORRECTION; 

            follower.style.transform = `translate3d(${adjustedX}px, ${adjustedY}px, 0) translate(-50%, -50%)`;
            
            // Ensure follower is visible
            follower.style.opacity = '1';
        });

        sidebar.addEventListener('mouseleave', () => {
            follower.style.opacity = '0';
        });
    }
});
