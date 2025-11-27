// =========================
// maintenance mode toggle
// =========================
const maintenanceMode = false; // CHANGE THIS to TRUE or FALSE for either redirect or no redirect to maintenance page.

if (maintenanceMode && !window.location.pathname.endsWith('/maintenance.html')) {
  window.location.replace('/maintenance.html');
}