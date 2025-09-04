import { useState, useEffect } from 'react';
import { supplierApplicationService } from '../services/supplierApplicationService';

export const useApplicationStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await supplierApplicationService.getApplicationStats();
        if (response.data.status === 'success') {
          setStats({
            total: response.data.data.total || 0,
            pending: response.data.data.breakdown?.pending || 0,
            approved: response.data.data.breakdown?.approved || 0,
            rejected: response.data.data.breakdown?.rejected || 0
          });
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching application stats:', err);
        setError(err);
        // Set default values on error
        setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Optionally refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error };
};