import api from './api';

const inventoryService = {
  // Generate inventory report
  generateReport: async (options = {}) => {
    try {
      const params = new URLSearchParams({
        type: options.type || 'inventory_summary',
        format: options.format || 'pdf',
        dateRange: options.dateRange || 'last_30_days',
        includeSupplierInfo: options.includeSupplierInfo || 'true',
        includeOutOfStock: options.includeOutOfStock || 'true',
        includeLowStock: options.includeLowStock || 'true'
      });

      const response = await api.get(`/inventory/reports/generate?${params}`, {
        responseType: 'blob', // Important for file download
        headers: {
          'Accept': 'application/pdf'
        }
      });

      // Create blob URL for download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `beautiful_inventory_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Report downloaded successfully' };
    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate report');
    }
  },

  // Get inventory overview/stats
  getOverview: async () => {
    try {
      const response = await api.get('/inventory');
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory overview:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch inventory data');
    }
  },

  // Get low stock alerts
  getLowStockAlerts: async () => {
    try {
      const response = await api.get('/inventory/low-stock');
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock alerts:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch low stock alerts');
    }
  }
};

export default inventoryService;