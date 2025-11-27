// redirect2.js — if already logged in, kick user off login.html
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('loginToken');
    console.log('[redirect2.js] loginToken =', token);

    if (token) {
        console.log('[redirect2.js] Token found → redirecting to /index.html');
        window.location.replace('/index.html');
    } else {
        console.log('[redirect2.js] No token found → stay on login page');
    }
});