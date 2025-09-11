import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  Plus,
  Eye,
  Edit,
  Navigation
} from 'lucide-react';
import SupplierLayout from '../../components/layout/SupplierLayout';

const SupplierDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inTransit: 0,
    delivered: 0,
    delayed: 0
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockDeliveries = [
      {
        id: 1,
        orderNumber: 'ORD-2024-001',
        products: [
          { name: 'Premium Oak Dining Table', quantity: 5 },
          { name: 'Oak Dining Chairs', quantity: 20 }
        ],
        totalValue: 2500,
        destination: 'Downtown Showroom',
        address: '123 Main Street, Downtown, City',
        status: 'in_transit',
        estimatedDelivery: '2024-01-20',
        trackingNumber: 'TRK123456789',
        driver: 'John Smith',
        driverPhone: '+1 234 567 8900',
        notes: 'Handle with care - premium furniture',
        createdAt: '2024-01-15',
        scheduledTime: '10:00 AM - 12:00 PM'
      },
      {
        id: 2,
        orderNumber: 'ORD-2024-002',
        products: [
          { name: 'Modern Office Chair', quantity: 10 },
          { name: 'Office Desk', quantity: 5 }
        ],
        totalValue: 1800,
        destination: 'Corporate Office',
        address: '456 Business Blvd, Corporate District',
        status: 'delivered',
        estimatedDelivery: '2024-01-18',
        actualDelivery: '2024-01-18',
        trackingNumber: 'TRK987654321',
        driver: 'Mike Johnson',
        driverPhone: '+1 234 567 8901',
        notes: 'Delivered successfully',
        createdAt: '2024-01-14',
        scheduledTime: '2:00 PM - 4:00 PM'
      },
      {
        id: 3,
        orderNumber: 'ORD-2024-003',
        products: [
          { name: 'LED Desk Lamp', quantity: 15 },
          { name: 'Monitor Stand', quantity: 8 }
        ],
        totalValue: 650,
        destination: 'Home Office Store',
        address: '789 Retail Park, Suburban Area',
        status: 'pending',
        estimatedDelivery: '2024-01-22',
        trackingNumber: null,
        driver: null,
        driverPhone: null,
        notes: 'Awaiting dispatch',
        createdAt: '2024-01-16',
        scheduledTime: null
      },
      {
        id: 4,
        orderNumber: 'ORD-2024-004',
        products: [
          { name: 'Ergonomic Keyboard', quantity: 8 },
          { name: 'Wireless Mouse', quantity: 8 }
        ],
        totalValue: 320,
        destination: 'Tech Solutions Inc',
        address: '321 Innovation Drive, Tech Hub',
        status: 'delayed',
        estimatedDelivery: '2024-01-19',
        trackingNumber: 'TRK555666777',
        driver: 'Sarah Wilson',
        driverPhone: '+1 234 567 8902',
        notes: 'Delayed due to weather conditions',
        createdAt: '2024-01-13',
        scheduledTime: '9:00 AM - 11:00 AM'
      }
    ];

    setTimeout(() => {
      setDeliveries(mockDeliveries);
      setStats({
        total: mockDeliveries.length,
        pending: mockDeliveries.filter(d => d.status === 'pending').length,
        inTransit: mockDeliveries.filter(d => d.status === 'in_transit').length,
        delivered: mockDeliveries.filter(d => d.status === 'delivered').length,
        delayed: mockDeliveries.filter(d => d.status === 'delayed').length
      });
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'in_transit': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'delivered': return 'text-green-600 bg-green-50 border-green-200';
      case 'delayed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'delayed': return <AlertTriangle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.products.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDelivery = (delivery) => {
    setSelectedDelivery(delivery);
    setShowModal(true);
  };

  if (loading) {
    return (
      <SupplierLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </SupplierLayout>
    );
  }

  return (
    <SupplierLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Deliveries</h1>
              <p className="text-blue-100">Track and manage your product deliveries</p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl">
              <Truck className="h-12 w-12" />
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <Package className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-blue-600">{stats.pending}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">In Transit</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.inTransit}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <Truck className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Delivered</p>
                <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Delayed</p>
                <p className="text-3xl font-bold text-red-600">{stats.delayed}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search deliveries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="delayed">Delayed</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Delivery
            </button>
          </div>

          {/* Deliveries List */}
          <div className="space-y-4">
            {filteredDeliveries.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No deliveries found</p>
              </div>
            ) : (
              filteredDeliveries.map((delivery) => (
                <div key={delivery.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{delivery.orderNumber}</h3>
                          <p className="text-gray-600 flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {delivery.destination}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(delivery.status)}`}>
                          {getStatusIcon(delivery.status)}
                          {delivery.status.replace('_', ' ').charAt(0).toUpperCase() + delivery.status.replace('_', ' ').slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Products</p>
                          <p className="font-semibold text-gray-900">{delivery.products.length} items</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Value</p>
                          <p className="font-semibold text-gray-900">${delivery.totalValue}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Est. Delivery</p>
                          <p className="font-semibold text-gray-900">{delivery.estimatedDelivery}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Tracking</p>
                          <p className="font-semibold text-gray-900">
                            {delivery.trackingNumber || 'Not assigned'}
                          </p>
                        </div>
                      </div>

                      {delivery.driver && (
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Driver: {delivery.driver}</span>
                          <span>Phone: {delivery.driverPhone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleViewDelivery(delivery)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                      {delivery.trackingNumber && (
                        <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                          <Navigation className="h-4 w-4" />
                          Track
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Delivery Details Modal */}
        {showModal && selectedDelivery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Delivery Details - {selectedDelivery.orderNumber}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Status and Tracking */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 ${getStatusColor(selectedDelivery.status)}`}>
                      {getStatusIcon(selectedDelivery.status)}
                      {selectedDelivery.status.replace('_', ' ').charAt(0).toUpperCase() + selectedDelivery.status.replace('_', ' ').slice(1)}
                    </span>
                    {selectedDelivery.trackingNumber && (
                      <span className="text-sm text-gray-600">
                        Tracking: {selectedDelivery.trackingNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Products</h3>
                  <div className="space-y-2">
                    {selectedDelivery.products.map((product, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-gray-600">Qty: {product.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Destination</h3>
                    <div className="space-y-2">
                      <p className="font-medium">{selectedDelivery.destination}</p>
                      <p className="text-gray-600 flex items-start gap-1">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        {selectedDelivery.address}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Schedule</h3>
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        <span className="font-medium">Estimated:</span> {selectedDelivery.estimatedDelivery}
                      </p>
                      {selectedDelivery.actualDelivery && (
                        <p className="text-gray-600">
                          <span className="font-medium">Actual:</span> {selectedDelivery.actualDelivery}
                        </p>
                      )}
                      {selectedDelivery.scheduledTime && (
                        <p className="text-gray-600">
                          <span className="font-medium">Time:</span> {selectedDelivery.scheduledTime}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Driver Information */}
                {selectedDelivery.driver && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Driver</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{selectedDelivery.driver}</span>
                        <span className="text-gray-600">{selectedDelivery.driverPhone}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedDelivery.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                    <p className="text-gray-600 p-4 bg-gray-50 rounded-lg">
                      {selectedDelivery.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedDelivery.trackingNumber && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    Track Package
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SupplierLayout>
  );
};

export default SupplierDeliveries;