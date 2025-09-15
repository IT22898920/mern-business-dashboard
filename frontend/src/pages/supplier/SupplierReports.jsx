import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart3, 
  TrendingUp,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  RefreshCcw,
  Eye,
  ChevronDown
} from 'lucide-react';
import SupplierLayout from '../../components/layout/SupplierLayout';

const SupplierReports = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('performance');
  const [reportData, setReportData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const reportTypes = [
    {
      id: 'performance',
      title: 'Performance Report',
      description: 'Overview of your supplier performance metrics',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'inventory',
      title: 'Inventory Report',
      description: 'Detailed inventory status and movements',
      icon: <Package className="h-6 w-6" />,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'financial',
      title: 'Financial Report',
      description: 'Revenue and payment analytics',
      icon: <DollarSign className="h-6 w-6" />,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'deliveries',
      title: 'Delivery Report',
      description: 'Delivery performance and statistics',
      icon: <Clock className="h-6 w-6" />,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const periodOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Mock data generation based on selected report and period
  const generateReportData = () => {
    const baseData = {
      performance: {
        kpis: [
          { label: 'Order Fulfillment Rate', value: '98.5%', trend: '+2.1%', positive: true },
          { label: 'On-Time Delivery Rate', value: '96.2%', trend: '+1.8%', positive: true },
          { label: 'Product Quality Score', value: '4.8/5', trend: '+0.2', positive: true },
          { label: 'Response Time (Avg)', value: '2.3 hrs', trend: '-0.5 hrs', positive: true }
        ],
        summary: 'Excellent performance across all metrics this month.',
        recommendations: [
          'Continue maintaining high quality standards',
          'Focus on reducing response time further',
          'Consider expanding product catalog'
        ]
      },
      inventory: {
        kpis: [
          { label: 'Total Products', value: '124', trend: '+8', positive: true },
          { label: 'Low Stock Items', value: '12', trend: '+3', positive: false },
          { label: 'Out of Stock', value: '2', trend: '-1', positive: true },
          { label: 'Inventory Value', value: '$45,280', trend: '+$2,150', positive: true }
        ],
        summary: 'Inventory levels are healthy with minimal stockouts.',
        topProducts: [
          { name: 'Premium Oak Dining Table', stock: 15, sales: 8 },
          { name: 'Modern Office Chair', stock: 25, sales: 12 },
          { name: 'LED Desk Lamp', stock: 45, sales: 22 }
        ]
      },
      financial: {
        kpis: [
          { label: 'Total Revenue', value: '$28,450', trend: '+$3,200', positive: true },
          { label: 'Average Order Value', value: '$340', trend: '+$25', positive: true },
          { label: 'Payment Delays', value: '1.2 days', trend: '-0.3 days', positive: true },
          { label: 'Outstanding Payments', value: '$2,150', trend: '-$500', positive: true }
        ],
        summary: 'Strong financial performance with improved cash flow.',
        monthlyRevenue: [
          { month: 'Jan', revenue: 25250 },
          { month: 'Feb', revenue: 28450 },
          { month: 'Mar', revenue: 31200 }
        ]
      },
      deliveries: {
        kpis: [
          { label: 'Total Deliveries', value: '86', trend: '+12', positive: true },
          { label: 'On-Time Rate', value: '94.2%', trend: '+3.1%', positive: true },
          { label: 'Average Delivery Time', value: '2.8 days', trend: '-0.2 days', positive: true },
          { label: 'Customer Satisfaction', value: '4.7/5', trend: '+0.1', positive: true }
        ],
        summary: 'Delivery performance is consistently strong.',
        deliveryTrends: [
          { status: 'Delivered', count: 81, percentage: 94.2 },
          { status: 'In Transit', count: 3, percentage: 3.5 },
          { status: 'Delayed', count: 2, percentage: 2.3 }
        ]
      }
    };

    return baseData[selectedReport];
  };

  useEffect(() => {
    setReportData(generateReportData());
  }, [selectedReport, selectedPeriod]);

  const handleGenerateReport = async (format) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // In a real app, this would trigger a download
      console.log(`Generating ${format} report for ${selectedReport} - ${selectedPeriod}`);
    }, 2000);
  };

  const handlePreviewReport = () => {
    setShowPreview(true);
  };

  return (
    <SupplierLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
              <p className="text-indigo-100">Generate comprehensive reports and insights</p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl">
              <FileText className="h-12 w-12" />
            </div>
          </div>
        </div>

        {/* Report Configuration */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate Report</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Report Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Report Type</label>
              <div className="space-y-3">
                {reportTypes.map((report) => (
                  <div key={report.id}>
                    <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="reportType"
                        value={report.id}
                        checked={selectedReport === report.id}
                        onChange={(e) => setSelectedReport(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                        selectedReport === report.id 
                          ? 'bg-indigo-600 text-white' 
                          : 'border-2 border-gray-300'
                      }`}>
                        {selectedReport === report.id && (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${report.color} text-white mr-3`}>
                        {report.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Period Selection and Actions */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Time Period</label>
                <div className="relative">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="appearance-none w-full bg-white border border-gray-200 rounded-lg px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {periodOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Actions</label>
                <div className="space-y-3">
                  <button
                    onClick={handlePreviewReport}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview Report
                  </button>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleGenerateReport('pdf')}
                      disabled={loading}
                      className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      {loading ? (
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      PDF
                    </button>
                    <button
                      onClick={() => handleGenerateReport('excel')}
                      disabled={loading}
                      className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      {loading ? (
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Excel
                    </button>
                    <button
                      onClick={() => handleGenerateReport('csv')}
                      disabled={loading}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      {loading ? (
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Preview */}
        {showPreview && reportData && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {reportTypes.find(r => r.id === selectedReport)?.title} Preview
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close preview</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {reportData.kpis.map((kpi, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">{kpi.label}</h3>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold text-gray-900">{kpi.value}</span>
                    <span className={`text-sm font-medium flex items-center gap-1 ${
                      kpi.positive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.positive ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                      {kpi.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
              <p className="text-gray-700">{reportData.summary}</p>
            </div>

            {/* Specific Report Content */}
            {selectedReport === 'inventory' && reportData.topProducts && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 font-semibold text-gray-900">Product Name</th>
                        <th className="text-left py-3 font-semibold text-gray-900">Current Stock</th>
                        <th className="text-left py-3 font-semibold text-gray-900">Sales This Period</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.topProducts.map((product, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 text-gray-900">{product.name}</td>
                          <td className="py-3 text-gray-600">{product.stock}</td>
                          <td className="py-3 text-gray-600">{product.sales}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedReport === 'financial' && reportData.monthlyRevenue && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-end justify-between h-32 gap-4">
                    {reportData.monthlyRevenue.map((item, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t w-full"
                          style={{ height: `${(item.revenue / 35000) * 100}%` }}
                        ></div>
                        <span className="text-sm font-medium text-gray-600 mt-2">{item.month}</span>
                        <span className="text-xs text-gray-500">${item.revenue.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedReport === 'deliveries' && reportData.deliveryTrends && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Status Distribution</h3>
                <div className="space-y-3">
                  {reportData.deliveryTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{trend.status}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                            style={{ width: `${trend.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12">
                          {trend.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {reportData.recommendations && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                <div className="bg-green-50 rounded-xl p-4">
                  <ul className="space-y-2">
                    {reportData.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2 text-green-800">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Reports */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Reports</h2>
          <div className="space-y-4">
            {[
              { name: 'Performance Report - December 2023', type: 'Performance', date: '2024-01-01', format: 'PDF' },
              { name: 'Inventory Analysis - Q4 2023', type: 'Inventory', date: '2024-01-01', format: 'Excel' },
              { name: 'Financial Summary - November 2023', type: 'Financial', date: '2023-12-01', format: 'PDF' }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-600">{report.type} • Generated on {report.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                    {report.format}
                  </span>
                  <button className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SupplierLayout>
  );
};

export default SupplierReports;