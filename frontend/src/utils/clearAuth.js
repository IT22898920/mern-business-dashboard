// Utility function to clear all authentication data
export const clearAuthData = () => {
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('skipSessionExpiredToast');
  
  // Clear sessionStorage
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  
  console.log('✅ All authentication data cleared');
};

// Auto-clear on page load for debugging
if (window.location.search.includes('clearauth')) {
  clearAuthData();
  window.location.href = '/login';
}