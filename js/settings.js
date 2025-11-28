// js/settings.js

// --- Global Disguise Data and Functions ---
const disguises = {
    "None": { title: "Delta V10", sub: "Default Title and Favicon", iconPath: "/static/favicons/deltav9.png" }, 
    "Clever": { title: "Clever | Log in", sub: "Mimics the Clever login page.", iconPath: "/static/favicons/clever.ico" },
    "Canvas": { title: "Dashboard", sub: "Mimics a typical Canvas dashboard.", iconPath: "/static/favicons/canvas.png" },
    "Google Drive": { title: "My Drive - Google Drive", sub: "Mimics the Google Drive application.", iconPath: "/static/favicons/drive.png" },
    "Edpuzzle": { title: "Edpuzzle | Student", sub: "Mimics an active Edpuzzle assignment.", iconPath: "/static/favicons/edpuzzle.png" },
    "Kahoot!": { title: "Kahoot! - Play & Create Quizzes", sub: "Mimics the Kahoot! quiz platform.", iconPath: "/static/favicons/kahoot.ico" }
};

// Helper function to update the page's favicon
const updatePageFavicon = (path) => {
    let link = document.getElementById("faviconLink");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        link.id = 'faviconLink';
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    // Ensure we are setting the correct type
    link.type = path.endsWith('.ico') ? 'image/x-icon' : 'image/png';
    link.href = path;
};


const applyDisguise = (selectedDisguiseValue) => {
    const disguise = disguises[selectedDisguiseValue] || disguises["None"];
    
    // 1. Update the actual browser tab title
    document.title = disguise.title;
    
    // 2. Update the browser tab favicon
    updatePageFavicon(disguise.iconPath); 

    // 3. Update the preview elements (only if they exist on settings.html)
    const disguiseTitle = document.getElementById('disguise-title');
    const disguiseSub = document.getElementById('disguise-sub');
    const disguiseFaviconImg = document.getElementById('disguise-favicon-preview-img'); 

    if (disguiseTitle) disguiseTitle.textContent = disguise.title;
    if (disguiseSub) disguiseSub.textContent = disguise.sub;
    if (disguiseFaviconImg) disguiseFaviconImg.src = disguise.iconPath;
};


// 💥 SPA FIX 1: Expose a function to apply the currently saved setting.
window.applyCurrentDisguise = () => {
    const savedDisguise = localStorage.getItem('deltaV9_disguise') || 'None';
    applyDisguise(savedDisguise);
};

// 💥 SPA FIX 2: Run the application logic immediately on script load to apply saved disguise.
window.applyCurrentDisguise(); 


// --- Utility Placeholder Functions ---

/**
 * Opens the current page in a new about:blank window (for cloaking).
 */
window.openCloakedPageWrapper = () => {
    const currentUrl = 'https://delta-v10-copy-1-16929075.codehs.me/index.html';
    const newWindow = window.open('about:blank', '_blank');

    if (newWindow) {
        const currentTitle = document.title;
        const currentFaviconLink = document.getElementById("faviconLink");
        const currentFaviconType = currentFaviconLink ? currentFaviconLink.type : 'image/x-icon';
        const currentFaviconHref = currentFaviconLink ? currentFaviconLink.href : '/static/favicons/canvas.png';

        const htmlContent = 
            '<!DOCTYPE html>' +
            '<html>' +
            '<head>' +
            `<title>${currentTitle}</title>` + 
            `<link rel="icon" type="${currentFaviconType}" href="${currentFaviconHref}">` + 
            '</head>' +
            '<body>' +
            '<p style="font-family: sans-serif; text-align: center; margin-top: 50px;">' +
            'Please wait while the page loads...' +
            '</p>' +
            `<iframe src="${currentUrl}" style="width:100%; height:100vh; border:none; position:fixed; top:0; left:0;" sandbox="allow-forms allow-scripts allow-same-origin"></iframe>` +
            '</body>' +
            '</html>';

        newWindow.document.write(htmlContent);
        newWindow.document.close();
    } else {
        console.error("Popup blocker prevented the cloak. Please disable it.");
        const statusElement = document.getElementById('import-status');
        if (statusElement) {
            statusElement.textContent = "Error: Popup blocker prevented the cloak.";
        }
    }
};


/** * Exports all data from localStorage to a downloadable JSON file. 
 */
window.downloadCookieData = () => { 
    const data = {};
    const statusElement = document.getElementById('import-status');

    // 1. Collect all localStorage data
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Exclude specific, potentially large or irrelevant keys if needed
        // if (!key.startsWith('some_prefix_to_exclude')) {
        data[key] = localStorage.getItem(key);
        // }
    }

    // 2. Convert to JSON string
    const jsonString = JSON.stringify(data, null, 2); 
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // 3. Create a temporary anchor element for download
    const a = document.createElement('a');
    a.href = url;
    a.download = `deltaV10_data_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click(); 
    document.body.removeChild(a); 
    URL.revokeObjectURL(url); // Clean up
    
    // 4. Update status
    if (statusElement) {
        statusElement.textContent = 'Data successfully downloaded!';
        setTimeout(() => statusElement.textContent = '', 5000);
    }
};

/** * Imports data from an uploaded JSON file and merges it into localStorage. 
 */
window.uploadCookieData = () => { 
    const statusElement = document.getElementById('import-status');

    // 1. Create a hidden file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.style.display = 'none';

    // 2. Define the change listener
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            if (statusElement) statusElement.textContent = 'No file selected.';
            setTimeout(() => statusElement.textContent = '', 5000);
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                let importedCount = 0;

                // 3. Load data into localStorage
                for (const key in importedData) {
                    if (Object.hasOwnProperty.call(importedData, key)) {
                        localStorage.setItem(key, importedData[key]);
                        importedCount++;
                    }
                }
                
                // 4. Re-apply settings (like the disguise)
                window.applyCurrentDisguise();

                // 5. Update status
                if (statusElement) {
                    statusElement.textContent = `Successfully imported ${importedCount} items. Please refresh for full effect.`;
                    setTimeout(() => statusElement.textContent = '', 10000);
                }

            } catch (error) {
                console.error('Error processing JSON file:', error);
                if (statusElement) {
                    statusElement.textContent = 'Error: Invalid JSON file format.';
                    setTimeout(() => statusElement.textContent = '', 5000);
                }
            }
        };

        reader.readAsText(file);
    };

    // 6. Trigger the file selection dialog and clean up
    document.body.appendChild(input);
    input.click();
    input.remove(); // Clean up the element after triggering
    
    // Initial status update
    if (statusElement) statusElement.textContent = 'Waiting for file selection...';
};


/**
 * 💥 SPA FIX 3: Main function to initialize settings page UI logic.
 * This is called by the main SPA router every time the settings page is loaded.
 */
window.initSettingsPage = () => {

    // --- Tab Switching Logic (Settings Page Only) ---
    const navButtonsContainer = document.getElementById('navButtons');
    if (navButtonsContainer) {
        // Ensure the default active tab is shown on page load (Settings page only)
        const activeNav = document.querySelector('.nav-btn.active');
        const initialPanelId = activeNav ? activeNav.getAttribute('data-target') : 'cloaking';

        // Hide all panels initially, then show the default one
        document.querySelectorAll('.panel').forEach(panel => {
            panel.setAttribute('hidden', true);
            panel.setAttribute('aria-hidden', true);
        });
        const initialPanel = document.getElementById(initialPanelId);
        if (initialPanel) {
            initialPanel.removeAttribute('hidden');
            initialPanel.setAttribute('aria-hidden', false);
        }
    }
    
    // --- Disguise UI Logic (Settings Page Only) ---
    const disguiseSelect = document.getElementById('disguiseSelect');
    
    // 1. Check if the disguise selection UI exists
    if (disguiseSelect) {
        // Set the dropdown to the saved/default value.
        disguiseSelect.value = localStorage.getItem('deltaV9_disguise') || 'None';

        // Add listener to SAVE the selection and apply the disguise
        disguiseSelect.addEventListener('change', (e) => {
            const selectedValue = e.target.value;
            // Apply immediately to current view
            applyDisguise(selectedValue);
            // Save the new selection to Local Storage for persistence
            localStorage.setItem('deltaV9_disguise', selectedValue); 
        });
        
        // Ensure preview elements are updated correctly on settings load.
        window.applyCurrentDisguise();
    }
};
