document.addEventListener('DOMContentLoaded', async () => {
    await loadAllowedUsers();
    const token = localStorage.getItem('loginToken');

    if (document.getElementById('login-form')) {
        // On login page → redirect to index if logged in
        if (token && await verifyToken(token)) window.location.href='/index.html';
    } else {
        // On index page → redirect to login if not logged in
        if (!token || !(await verifyToken(token))) window.location.href='/login.html';
        else document.body.style.display='block'; // show content if logged in
    }
});