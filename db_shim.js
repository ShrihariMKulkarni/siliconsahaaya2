/**
 * SiliconSahaaya Database Shim
 * This script intercepts localStorage calls and redirects them to a shared backend server.
 * It ensures that the existing UI code works without modification while providing a shared database.
 */

(function() {
    const API_URL = 'http://localhost:5000/api';
    let dbCache = {
        complaints: [],
        emailLogs: []
    };

    // Initialize cache from server
    async function initCache() {
        try {
            const response = await fetch(`${API_URL}/all`);
            const data = await response.json();
            dbCache.complaints = data.complaints || [];
            dbCache.emailLogs = data.emailLogs || [];
            
            // Trigger a custom event so the UI knows data is ready
            window.dispatchEvent(new CustomEvent('dbReady'));
            
            // Also update the local storage as a fallback, 
            // but we will primarily use the interceptor
            localStorage._complaints = JSON.stringify(dbCache.complaints);
            localStorage._emailLogs = JSON.stringify(dbCache.emailLogs);
        } catch (err) {
            console.error('Failed to sync with shared database:', err);
        }
    }

    // Intercept localStorage.getItem
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = function(key) {
        if (key === 'complaints') {
            return JSON.stringify(dbCache.complaints);
        }
        if (key === 'emailLogs') {
            return JSON.stringify(dbCache.emailLogs);
        }
        return originalGetItem.apply(this, arguments);
    };

    // Intercept localStorage.setItem
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        if (key === 'complaints') {
            try {
                const list = JSON.parse(value);
                dbCache.complaints = list;
                // Async sync to server
                fetch(`${API_URL}/complaints`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: value
                });
            } catch (e) {}
            return;
        }
        if (key === 'emailLogs') {
            try {
                const logs = JSON.parse(value);
                dbCache.emailLogs = logs;
                // Async sync to server
                fetch(`${API_URL}/emaillogs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: value
                });
            } catch (e) {}
            return;
        }
        return originalSetItem.apply(this, arguments);
    };

    // Start initialization
    initCache();

    // Poll for updates every 5 seconds to keep tabs in sync
    setInterval(initCache, 5000);
})();
