/**
 * Diagnostics Enabler Utility
 * 
 * This utility allows users to enable diagnostics by adding ?debug=true to the URL.
 * It's useful for debugging production issues on real devices.
 */

// Check if diagnostics mode is enabled via URL parameter
export const isDiagnosticsEnabled = () => {
  // Check for ?debug=true in the URL
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('debug') === 'true';
};

// Helper to create a diagnostics URL from the current page
export const createDiagnosticsUrl = () => {
  const url = new URL(window.location.href);
  url.searchParams.set('debug', 'true');
  return url.toString();
};

// Show a diagnostics notice to the user
export const showDiagnosticsNotice = () => {
  if (document.getElementById('diagnostics-notice')) return; // Avoid duplicates
  
  const notice = document.createElement('div');
  notice.id = 'diagnostics-notice';
  notice.style.position = 'fixed';
  notice.style.bottom = '80px';
  notice.style.left = '20px';
  notice.style.right = '20px';
  notice.style.backgroundColor = '#f0f9ff';
  notice.style.color = '#0c4a6e';
  notice.style.padding = '10px';
  notice.style.borderRadius = '8px';
  notice.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  notice.style.zIndex = '9999';
  notice.style.fontSize = '12px';
  notice.style.textAlign = 'center';
  
  notice.innerHTML = `
    <p style="margin: 0 0 8px 0; font-weight: bold;">Diagnostics Mode Active</p>
    <p style="margin: 0;">API connectivity information is shown at the bottom of the screen.</p>
    <button id="close-diagnostics" style="background: #0369a1; color: white; border: none; padding: 5px 10px; margin-top: 8px; border-radius: 4px;">Close</button>
  `;
  
  document.body.appendChild(notice);
  
  document.getElementById('close-diagnostics').addEventListener('click', () => {
    // Remove the diagnostics parameter from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('debug');
    window.history.replaceState({}, document.title, url.toString());
    
    // Remove the notice
    document.getElementById('diagnostics-notice').remove();
    
    // Reload the page to disable diagnostics
    window.location.reload();
  });
};

export default {
  isDiagnosticsEnabled,
  createDiagnosticsUrl,
  showDiagnosticsNotice
};
