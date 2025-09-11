import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Box,
  BarChart3,
  ArrowUpDown,
  ShoppingBag,
  Activity,
  Layers,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
  Clock,
  Tag,
  X,
  FileText,
  Calendar,
  ChevronDown,
  Printer,
  FileSpreadsheet,
  PieChart
} from 'lucide-react';
import SupplierLayout from '../../components/layout/SupplierLayout';
import { useAlert } from '../../components/AlertSystem';

const SupplierProducts = () => {
  const { showSuccess, showError, showInfo } = useAlert();
  
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0
  });
  
  // View mode
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Selected product for details
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Report generation state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('inventory');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [reportDateRange, setReportDateRange] = useState('current');
  const [generatingReport, setGeneratingReport] = useState(false);

  // Handler for opening product details modal
  const handleViewProduct = (product) => {
    console.log('Opening product details for:', product.name);
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  // Handler for closing product details modal
  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedProduct(null);
  };

  // Fetch products on component mount and when filters change
  useEffect(() => {
    fetchProducts();
  }, [currentPage, statusFilter, stockFilter, sortBy, sortOrder]);

  // Handle escape key for modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && showDetailsModal) {
        handleCloseModal();
      }
    };

    if (showDetailsModal) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [showDetailsModal]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: viewMode === 'grid' ? 12 : 10,
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/products/supplier/my-products?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.data?.products || []);
        setPagination(data.data?.pagination || {});
        setStats(data.data?.stats || {});
        
        // Apply client-side stock filtering
        if (stockFilter !== 'all') {
          let filteredProducts = data.data?.products || [];
          if (stockFilter === 'low') {
            filteredProducts = filteredProducts.filter(p => 
              p.stock?.current > 0 && p.stock?.current <= p.stock?.low_stock_threshold
            );
          } else if (stockFilter === 'out') {
            filteredProducts = filteredProducts.filter(p => p.stock?.current === 0);
          } else if (stockFilter === 'in') {
            filteredProducts = filteredProducts.filter(p => 
              p.stock?.current > p.stock?.low_stock_threshold
            );
          }
          setProducts(filteredProducts);
        }
      } else {
        showError('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showError('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const getStockStatus = (product) => {
    if (!product.stock?.track_inventory) return { label: 'Not Tracked', color: 'gray', percentage: 100 };
    if (product.stock?.current === 0) return { label: 'Out of Stock', color: 'red', percentage: 0 };
    if (product.stock?.current <= product.stock?.low_stock_threshold) {
      const percentage = (product.stock.current / product.stock.low_stock_threshold) * 50;
      return { label: 'Low Stock', color: 'yellow', percentage };
    }
    return { label: 'In Stock', color: 'green', percentage: 100 };
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-green-200';
      case 'draft': return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-gray-200';
      case 'inactive': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-yellow-200';
      case 'discontinued': return 'bg-gradient-to-r from-red-400 to-red-600 text-white shadow-red-200';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-gray-200';
    }
  };

  const exportProducts = () => {
    const csvContent = [
      ['Product Name', 'SKU', 'Category', 'Current Stock', 'Price', 'Status'],
      ...products.map(p => [
        p.name,
        p.sku,
        p.category?.name || 'N/A',
        p.stock?.current || 0,
        p.price || 0,
        p.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supplier-products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showSuccess('Products exported successfully');
  };

  // Report generation functions
  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      const reportData = await generateReportData();
      
      switch (reportFormat) {
        case 'pdf':
          await generatePDFReport(reportData);
          break;
        case 'excel':
          await generateExcelReport(reportData);
          break;
        case 'csv':
          await generateCSVReport(reportData);
          break;
        default:
          await generatePDFReport(reportData);
      }
      
      showSuccess(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully!`);
      setShowReportModal(false);
    } catch (error) {
      console.error('Report generation failed:', error);
      showError('Failed to generate report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const generateReportData = async () => {
    const currentDate = new Date();
    const reportTitle = getReportTitle();
    
    let filteredProducts = [...products];
    
    // Filter products based on report type
    switch (reportType) {
      case 'low-stock':
        filteredProducts = products.filter(p => 
          p.stock?.current <= p.stock?.low_stock_threshold && p.stock?.current > 0
        );
        break;
      case 'out-of-stock':
        filteredProducts = products.filter(p => p.stock?.current === 0);
        break;
      case 'active-products':
        filteredProducts = products.filter(p => p.status === 'active');
        break;
      case 'inventory':
      default:
        filteredProducts = products;
    }

    return {
      title: reportTitle,
      generatedDate: currentDate.toLocaleDateString(),
      generatedTime: currentDate.toLocaleTimeString(),
      products: filteredProducts,
      stats: {
        totalProducts: filteredProducts.length,
        totalValue: filteredProducts.reduce((sum, p) => sum + (p.price * (p.stock?.current || 0)), 0),
        averagePrice: filteredProducts.length > 0 ? 
          filteredProducts.reduce((sum, p) => sum + (p.price || 0), 0) / filteredProducts.length : 0,
        lowStockCount: filteredProducts.filter(p => 
          p.stock?.current <= p.stock?.low_stock_threshold && p.stock?.current > 0
        ).length,
        outOfStockCount: filteredProducts.filter(p => p.stock?.current === 0).length
      }
    };
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'inventory':
        return 'Complete Inventory Report';
      case 'low-stock':
        return 'Low Stock Alert Report';
      case 'out-of-stock':
        return 'Out of Stock Report';
      case 'active-products':
        return 'Active Products Report';
      default:
        return 'Product Report';
    }
  };

  const generatePDFReport = async (data) => {
    try {
      // Import jsPDF dynamically
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');

      // Create new PDF document
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Enhanced Color Palette
      const primaryColor = [37, 99, 235]; // Blue
      const primaryLight = [147, 197, 253]; // Light Blue
      const secondaryColor = [107, 114, 128]; // Gray
      const accentColor = [168, 85, 247]; // Purple
      const successColor = [34, 197, 94]; // Green
      const successLight = [134, 239, 172]; // Light Green
      const warningColor = [245, 158, 11]; // Orange
      const warningLight = [253, 230, 138]; // Light Orange
      const errorColor = [239, 68, 68]; // Red
      const errorLight = [252, 165, 165]; // Light Red
      const backgroundColor = [248, 250, 252]; // Very Light Gray

      // ENHANCED HEADER with gradient effect
      // Main header background
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 50, 'F');
      
      // Gradient overlay effect (simulated with lighter rectangles)
      doc.setFillColor(...primaryLight);
      doc.rect(0, 0, pageWidth, 15, 'F');
      
      // Company logo placeholder (decorative circle)
      doc.setFillColor(255, 255, 255);
      doc.circle(25, 25, 8, 'F');
      doc.setFillColor(...primaryColor);
      doc.circle(25, 25, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('SP', 25, 28, { align: 'center' });

      // Main title with shadow effect
      doc.setTextColor(220, 220, 220);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text(data.title, pageWidth / 2 + 1, 22, { align: 'center' });
      
      doc.setTextColor(255, 255, 255);
      doc.text(data.title, pageWidth / 2, 21, { align: 'center' });
      
      // Subtitle
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('📊 Comprehensive Business Intelligence Report', pageWidth / 2, 32, { align: 'center' });
      
      // Date and time with icon
      doc.setFontSize(9);
      doc.text(`🕐 Generated: ${data.generatedDate} at ${data.generatedTime}`, pageWidth / 2, 42, { align: 'center' });

      let yPosition = 65;

      // ENHANCED EXECUTIVE SUMMARY SECTION
      doc.setTextColor(0, 0, 0);
      doc.setFillColor(...backgroundColor);
      doc.roundedRect(15, yPosition - 5, pageWidth - 30, 25, 3, 3, 'F');
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('📋 Executive Summary', 20, yPosition + 5);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const summaryText = `This comprehensive inventory report provides detailed insights into ${data.stats.totalProducts} products with a combined value of $${data.stats.totalValue.toFixed(2)}. Current analysis shows ${data.stats.activeProducts} active products, ${data.stats.lowStockCount} items requiring restocking, and ${data.stats.outOfStockCount} out-of-stock items requiring immediate attention.`;
      
      const summaryLines = doc.splitTextToSize(summaryText, pageWidth - 50);
      doc.text(summaryLines, 20, yPosition + 12);
      
      yPosition += 35;

      // ENHANCED STATISTICS CARDS with charts
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('📊 Key Performance Indicators', 20, yPosition);
      yPosition += 15;

      // Create more sophisticated stat cards
      const statsData = [
        { 
          label: '📦 Total Products', 
          value: data.stats.totalProducts.toString(), 
          color: primaryColor,
          lightColor: primaryLight,
          icon: '📦',
          percentage: 100 
        },
        { 
          label: '💰 Inventory Value', 
          value: `$${data.stats.totalValue.toFixed(2)}`, 
          color: successColor,
          lightColor: successLight,
          icon: '💰',
          percentage: 100 
        },
        { 
          label: '📈 Avg. Product Price', 
          value: `$${data.stats.averagePrice.toFixed(2)}`, 
          color: accentColor,
          lightColor: [221, 214, 254],
          icon: '📈',
          percentage: 100 
        },
        { 
          label: '⚠️ Low Stock Alert', 
          value: data.stats.lowStockCount.toString(), 
          color: warningColor,
          lightColor: warningLight,
          icon: '⚠️',
          percentage: (data.stats.lowStockCount / data.stats.totalProducts) * 100 
        },
        { 
          label: '🚫 Out of Stock', 
          value: data.stats.outOfStockCount.toString(), 
          color: errorColor,
          lightColor: errorLight,
          icon: '🚫',
          percentage: (data.stats.outOfStockCount / data.stats.totalProducts) * 100 
        },
        { 
          label: '✅ In Stock Products', 
          value: (data.stats.totalProducts - data.stats.lowStockCount - data.stats.outOfStockCount).toString(), 
          color: successColor,
          lightColor: successLight,
          icon: '✅',
          percentage: ((data.stats.totalProducts - data.stats.lowStockCount - data.stats.outOfStockCount) / data.stats.totalProducts) * 100 
        }
      ];

      const cardWidth = (pageWidth - 50) / 2;
      const cardHeight = 35;
      let xPosition = 20;
      let rowCount = 0;

      statsData.forEach((stat, index) => {
        if (index > 0 && index % 2 === 0) {
          yPosition += cardHeight + 10;
          xPosition = 20;
          rowCount++;
        }

        // Card background with shadow
        doc.setFillColor(200, 200, 200);
        doc.roundedRect(xPosition + 2, yPosition + 2, cardWidth - 5, cardHeight, 5, 5, 'F');
        
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(xPosition, yPosition, cardWidth - 5, cardHeight, 5, 5, 'F');
        
        // Card border
        doc.setDrawColor(...stat.color);
        doc.setLineWidth(1);
        doc.roundedRect(xPosition, yPosition, cardWidth - 5, cardHeight, 5, 5, 'S');

        // Progress bar background
        doc.setFillColor(...stat.lightColor);
        doc.roundedRect(xPosition + 5, yPosition + cardHeight - 8, cardWidth - 15, 4, 2, 2, 'F');
        
        // Progress bar fill
        const progressWidth = ((cardWidth - 15) * Math.min(stat.percentage, 100)) / 100;
        doc.setFillColor(...stat.color);
        doc.roundedRect(xPosition + 5, yPosition + cardHeight - 8, progressWidth, 4, 2, 2, 'F');

        // Icon and value
        doc.setFontSize(20);
        doc.setTextColor(...stat.color);
        doc.setFont('helvetica', 'bold');
        doc.text(stat.value, xPosition + cardWidth / 2 - 2.5, yPosition + 15, { align: 'center' });

        // Label
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(stat.label, xPosition + cardWidth / 2 - 2.5, yPosition + 23, { align: 'center' });

        // Percentage text
        doc.setFontSize(7);
        doc.setTextColor(...stat.color);
        doc.text(`${stat.percentage.toFixed(1)}%`, xPosition + cardWidth - 15, yPosition + cardHeight - 10);

        xPosition += cardWidth + 10;
      });

      yPosition += 50;

      // INVENTORY HEALTH CHART (Visual representation)
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('📈 Inventory Health Overview', 20, yPosition);
      yPosition += 15;

      // Create a simple pie chart representation
      const centerX = pageWidth / 2;
      const centerY = yPosition + 25;
      const radius = 20;

      const inStockCount = data.stats.totalProducts - data.stats.lowStockCount - data.stats.outOfStockCount;
      const total = data.stats.totalProducts;
      
      // Calculate angles
      const inStockAngle = (inStockCount / total) * 360;
      const lowStockAngle = (data.stats.lowStockCount / total) * 360;
      const outOfStockAngle = (data.stats.outOfStockCount / total) * 360;

      // Draw pie chart segments (simplified)
      let startAngle = 0;
      
      // In Stock (Green)
      doc.setFillColor(...successColor);
      drawPieSlice(doc, centerX, centerY, radius, startAngle, startAngle + inStockAngle);
      startAngle += inStockAngle;
      
      // Low Stock (Orange)
      doc.setFillColor(...warningColor);
      drawPieSlice(doc, centerX, centerY, radius, startAngle, startAngle + lowStockAngle);
      startAngle += lowStockAngle;
      
      // Out of Stock (Red)
      doc.setFillColor(...errorColor);
      drawPieSlice(doc, centerX, centerY, radius, startAngle, startAngle + outOfStockAngle);

      // Chart legend
      const legendY = centerY + 35;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      // Legend items
      doc.setFillColor(...successColor);
      doc.roundedRect(centerX - 60, legendY, 4, 4, 1, 1, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text(`In Stock: ${inStockCount} (${((inStockCount/total)*100).toFixed(1)}%)`, centerX - 50, legendY + 3);
      
      doc.setFillColor(...warningColor);
      doc.roundedRect(centerX - 60, legendY + 8, 4, 4, 1, 1, 'F');
      doc.text(`Low Stock: ${data.stats.lowStockCount} (${((data.stats.lowStockCount/total)*100).toFixed(1)}%)`, centerX - 50, legendY + 11);
      
      doc.setFillColor(...errorColor);
      doc.roundedRect(centerX - 60, legendY + 16, 4, 4, 1, 1, 'F');
      doc.text(`Out of Stock: ${data.stats.outOfStockCount} (${((data.stats.outOfStockCount/total)*100).toFixed(1)}%)`, centerX - 50, legendY + 19);

      yPosition += 70;

      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      // ENHANCED PRODUCT TABLE SECTION
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('📋 Detailed Product Inventory', 20, yPosition);
      yPosition += 10;

      // Prepare enhanced table data with more information
      const tableData = data.products.map((product, index) => [
        (index + 1).toString(),
        product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name,
        product.sku,
        product.category?.name || 'Uncategorized',
        (product.stock?.current || 0).toString(),
        (product.stock?.low_stock_threshold || 0).toString(),
        `$${(product.price || 0).toFixed(2)}`,
        product.status.toUpperCase(),
        `$${((product.price || 0) * (product.stock?.current || 0)).toFixed(2)}`
      ]);

      // Enhanced auto-table for products
      doc.autoTable({
        head: [['#', 'Product Name', 'SKU', 'Category', 'Stock', 'Min.', 'Price', 'Status', 'Total Value']],
        body: tableData,
        startY: yPosition,
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [40, 40, 40],
          cellPadding: 3
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' }, // #
          1: { cellWidth: 40 }, // Product Name
          2: { cellWidth: 22, halign: 'center' }, // SKU
          3: { cellWidth: 25, halign: 'center' }, // Category
          4: { cellWidth: 15, halign: 'center' }, // Stock
          5: { cellWidth: 12, halign: 'center' }, // Min
          6: { cellWidth: 20, halign: 'right' }, // Price
          7: { cellWidth: 18, halign: 'center' }, // Status
          8: { cellWidth: 25, halign: 'right' }  // Total Value
        },
        didParseCell: function(data) {
          if (data.section === 'body') {
            const rowIndex = data.row.index;
            const product = data.products?.[rowIndex] || tableData[rowIndex];
            
            // Color code stock levels
            if (data.column.index === 4) { // Stock column
              const stockValue = parseInt(data.cell.raw);
              const minStock = product ? parseInt(product[5]) : 0;
              
              if (stockValue === 0) {
                data.cell.styles.fillColor = errorLight;
                data.cell.styles.textColor = errorColor;
                data.cell.styles.fontStyle = 'bold';
              } else if (stockValue <= minStock) {
                data.cell.styles.fillColor = warningLight;
                data.cell.styles.textColor = warningColor;
                data.cell.styles.fontStyle = 'bold';
              } else {
                data.cell.styles.fillColor = successLight;
                data.cell.styles.textColor = successColor;
                data.cell.styles.fontStyle = 'bold';
              }
            }
            
            // Color code status
            if (data.column.index === 7) { // Status column
              const status = data.cell.raw.toLowerCase();
              if (status === 'active') {
                data.cell.styles.fillColor = successLight;
                data.cell.styles.textColor = successColor;
                data.cell.styles.fontStyle = 'bold';
              } else if (status === 'inactive' || status === 'discontinued') {
                data.cell.styles.fillColor = errorLight;
                data.cell.styles.textColor = errorColor;
                data.cell.styles.fontStyle = 'bold';
              } else {
                data.cell.styles.fillColor = warningLight;
                data.cell.styles.textColor = warningColor;
              }
            }

            // Highlight high value items
            if (data.column.index === 8) { // Total Value column
              const value = parseFloat(data.cell.raw.replace('$', ''));
              if (value > 1000) {
                data.cell.styles.fillColor = [220, 252, 231];
                data.cell.styles.textColor = successColor;
                data.cell.styles.fontStyle = 'bold';
              }
            }
          }
        },
        margin: { left: 15, right: 15 },
        pageBreak: 'auto',
        showHead: 'everyPage'
      });

      // ENHANCED FOOTER for every page
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Footer background with gradient effect
        doc.setFillColor(...backgroundColor);
        doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');
        
        doc.setFillColor(...primaryColor);
        doc.rect(0, pageHeight - 30, pageWidth, 3, 'F');
        
        // Footer content
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('🏢 Generated by Supplier Portal System', 20, pageHeight - 20);
        doc.text('📧 support@businessdashboard.com', 20, pageHeight - 14);
        doc.text(`© ${new Date().getFullYear()} Business Dashboard - All rights reserved`, 20, pageHeight - 8);
        
        // Page info with style
        doc.setTextColor(...primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 15, { align: 'right' });
        
        // Report ID
        doc.setTextColor(120, 120, 120);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(`Report ID: INV-${new Date().getTime().toString().slice(-8)}`, pageWidth - 20, pageHeight - 8, { align: 'right' });
      }

      // Save the PDF with enhanced filename
      const fileName = `${reportType}-report-${new Date().toISOString().split('T')[0]}-enhanced.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('PDF generation failed:', error);
      
      // Fallback to HTML method if jsPDF fails
      showError('Advanced PDF generation failed. Using fallback method...');
      await generateHTMLReport(data);
    }
  };

  // Helper function to draw pie chart slices
  const drawPieSlice = (doc, centerX, centerY, radius, startAngle, endAngle) => {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    doc.moveTo(centerX, centerY);
    doc.lineTo(
      centerX + radius * Math.cos(startAngleRad),
      centerY + radius * Math.sin(startAngleRad)
    );
    
    // Create arc (simplified - jsPDF doesn't have perfect arc support)
    const steps = Math.max(1, Math.floor(Math.abs(endAngle - startAngle) / 5));
    for (let i = 0; i <= steps; i++) {
      const angle = startAngleRad + (i * (endAngleRad - startAngleRad)) / steps;
      doc.lineTo(
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle)
      );
    }
    
    doc.lineTo(centerX, centerY);
    doc.fill();
  };

  // Fallback HTML method
  const generateHTMLReport = async (data) => {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${data.title}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: Arial, sans-serif; margin: 0; color: #333; font-size: 12px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
          .header h1 { color: #2563eb; margin: 0; font-size: 24px; }
          .header p { margin: 5px 0; color: #666; }
          .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin: 20px 0; }
          .stat { text-align: center; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .stat-value { font-size: 18px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
          .stat-label { font-size: 11px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10px; }
          th, td { padding: 8px 6px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          th { background: #f1f5f9; font-weight: bold; color: #374151; }
          tr:nth-child(even) { background: #f8fafc; }
          .status-active { color: #059669; font-weight: bold; }
          .status-inactive { color: #dc2626; font-weight: bold; }
          .stock-low { color: #d97706; font-weight: bold; }
          .stock-out { color: #dc2626; font-weight: bold; }
          .stock-good { color: #059669; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 10px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          @media print {
            .no-print { display: none !important; }
            body { print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.title}</h1>
          <p>Generated on: ${data.generatedDate} at ${data.generatedTime}</p>
          <p>Total Products: ${data.stats.totalProducts}</p>
        </div>

        <div class="stats">
          <div class="stat">
            <div class="stat-value">${data.stats.totalProducts}</div>
            <div class="stat-label">Total Products</div>
          </div>
          <div class="stat">
            <div class="stat-value">$${data.stats.totalValue.toFixed(2)}</div>
            <div class="stat-label">Total Inventory Value</div>
          </div>
          <div class="stat">
            <div class="stat-value">$${data.stats.averagePrice.toFixed(2)}</div>
            <div class="stat-label">Average Price</div>
          </div>
          <div class="stat">
            <div class="stat-value">${data.stats.lowStockCount}</div>
            <div class="stat-label">Low Stock Items</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Status</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            ${data.products.map(product => `
              <tr>
                <td>${product.name}</td>
                <td>${product.sku}</td>
                <td>${product.category?.name || 'Uncategorized'}</td>
                <td class="${getStockClass(product)}">${product.stock?.current || 0}</td>
                <td>$${(product.price || 0).toFixed(2)}</td>
                <td class="status-${product.status}">${product.status.toUpperCase()}</td>
                <td>$${((product.price || 0) * (product.stock?.current || 0)).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>This report was generated automatically by the Supplier Portal System</p>
          <p>© ${new Date().getFullYear()} Business Dashboard - All rights reserved</p>
        </div>

        <script>
          // Auto print when loaded (for PDF generation)
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    // Open in new window for printing to PDF
    const newWindow = window.open('', '_blank');
    newWindow.document.write(htmlContent);
    newWindow.document.close();
  };

  const getStockClass = (product) => {
    if (product.stock?.current === 0) return 'stock-out';
    if (product.stock?.current <= product.stock?.low_stock_threshold) return 'stock-low';
    return 'stock-good';
  };

  const generateExcelReport = async (data) => {
    // Generate Excel-compatible CSV with enhanced formatting
    const csvContent = [
      [`${data.title}`],
      [`Generated on: ${data.generatedDate} at ${data.generatedTime}`],
      [],
      ['SUMMARY STATISTICS'],
      ['Total Products', data.stats.totalProducts],
      ['Total Inventory Value', `$${data.stats.totalValue.toFixed(2)}`],
      ['Average Price', `$${data.stats.averagePrice.toFixed(2)}`],
      ['Low Stock Items', data.stats.lowStockCount],
      ['Out of Stock Items', data.stats.outOfStockCount],
      [],
      ['PRODUCT DETAILS'],
      ['Product Name', 'SKU', 'Category', 'Current Stock', 'Price', 'Status', 'Stock Value', 'Stock Status'],
      ...data.products.map(product => [
        product.name,
        product.sku,
        product.category?.name || 'Uncategorized',
        product.stock?.current || 0,
        (product.price || 0).toFixed(2),
        product.status.toUpperCase(),
        ((product.price || 0) * (product.stock?.current || 0)).toFixed(2),
        getStockStatusText(product)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSVReport = async (data) => {
    const csvContent = [
      ['Product Name', 'SKU', 'Category', 'Current Stock', 'Price', 'Status', 'Stock Value'],
      ...data.products.map(product => [
        product.name,
        product.sku,
        product.category?.name || 'Uncategorized',
        product.stock?.current || 0,
        (product.price || 0).toFixed(2),
        product.status.toUpperCase(),
        ((product.price || 0) * (product.stock?.current || 0)).toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStockStatusText = (product) => {
    if (product.stock?.current === 0) return 'OUT OF STOCK';
    if (product.stock?.current <= product.stock?.low_stock_threshold) return 'LOW STOCK';
    return 'IN STOCK';
  };

  if (loading && products.length === 0) {
    return (
      <SupplierLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-32 w-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-ping"></div>
              </div>
              <RefreshCw className="h-12 w-12 animate-spin text-gradient bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-4 relative z-10" />
            </div>
            <p className="text-gray-600 font-medium mt-4">Loading your products...</p>
          </div>
        </div>
      </SupplierLayout>
    );
  }

  return (
    <SupplierLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Animated Header */}
          <div className="mb-8 animate-fade-in">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <Package className="h-10 w-10" />
                    My Products
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Manage and monitor your assigned inventory
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => fetchProducts()}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 p-3 rounded-lg"
                    title="Refresh"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
                  >
                    <FileText className="h-5 w-5" />
                    Generate Report
                  </button>
                  <button
                    onClick={exportProducts}
                    className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-3 rounded-lg hover:bg-white/30 transition-all duration-300 font-medium"
                  >
                    <Download className="h-4 w-4" />
                    Quick Export
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Products Card */}
            <div className="group hover:scale-105 transition-all duration-300">
              <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl p-6 border border-blue-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full -mr-16 -mt-16 opacity-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                      <ShoppingBag className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-full">
                      TOTAL
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.totalProducts}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Total Products</p>
                  <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Products Card */}
            <div className="group hover:scale-105 transition-all duration-300">
              <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl p-6 border border-green-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full -mr-16 -mt-16 opacity-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.activeProducts}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Active Products</p>
                  <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.activeProducts / stats.totalProducts) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Low Stock Card */}
            <div className="group hover:scale-105 transition-all duration-300">
              <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl p-6 border border-yellow-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full -mr-16 -mt-16 opacity-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs text-orange-600 font-semibold bg-orange-50 px-2 py-1 rounded-full animate-pulse">
                      WARNING
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.lowStockProducts}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Low Stock Items</p>
                  <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"
                      style={{ width: `${(stats.lowStockProducts / stats.totalProducts) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Out of Stock Card */}
            <div className="group hover:scale-105 transition-all duration-300">
              <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl p-6 border border-red-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400 to-red-600 rounded-full -mr-16 -mt-16 opacity-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-lg">
                      <XCircle className="h-6 w-6 text-white" />
                    </div>
                    {stats.outOfStockProducts > 0 && (
                      <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded-full animate-bounce">
                        CRITICAL
                      </span>
                    )}
                  </div>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.outOfStockProducts}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Out of Stock</p>
                  <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full"
                      style={{ width: `${(stats.outOfStockProducts / stats.totalProducts) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters and Search */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search products by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer"
                >
                  <option value="all">📋 All Status</option>
                  <option value="active">✅ Active</option>
                  <option value="draft">📝 Draft</option>
                  <option value="inactive">⏸️ Inactive</option>
                  <option value="discontinued">🚫 Discontinued</option>
                </select>

                <select
                  value={stockFilter}
                  onChange={(e) => {
                    setStockFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer"
                >
                  <option value="all">📦 All Stock</option>
                  <option value="in">✅ In Stock</option>
                  <option value="low">⚠️ Low Stock</option>
                  <option value="out">❌ Out of Stock</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-all ${
                      viewMode === 'grid' 
                        ? 'bg-white shadow-md text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-all ${
                      viewMode === 'list' 
                        ? 'bg-white shadow-md text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Products Display */}
          {viewMode === 'grid' ? (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.length > 0 ? (
                products.map((product, index) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <div
                      key={product._id}
                      className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Product Image Placeholder */}
                      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Package className="h-16 w-16 text-gray-300" />
                        </div>
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-lg ${getStatusBadgeClass(product.status)}`}>
                            {product.status.toUpperCase()}
                          </span>
                        </div>
                        {/* Stock Indicator */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-600">Stock Level</span>
                              <span className={`text-xs font-bold text-${stockStatus.color}-600`}>
                                {product.stock?.current || 0} units
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${
                                  stockStatus.color === 'green' ? 'from-green-400 to-green-600' :
                                  stockStatus.color === 'yellow' ? 'from-yellow-400 to-orange-500' :
                                  stockStatus.color === 'red' ? 'from-red-400 to-red-600' :
                                  'from-gray-400 to-gray-600'
                                } transition-all duration-500`}
                                style={{ width: `${stockStatus.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-1 truncate group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3 font-mono">
                          SKU: {product.sku}
                        </p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1">
                            <Tag className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {product.category?.name || 'Uncategorized'}
                            </span>
                          </div>
                          <span className="text-lg font-bold text-blue-600">
                            ${product.price?.toFixed(2) || '0.00'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleViewProduct(product)}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-105 font-medium"
                        >
                          <Eye className="h-5 w-5 flex-shrink-0" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-32 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full opacity-20 animate-ping"></div>
                    </div>
                    <Package className="h-20 w-20 text-gray-300 relative z-10" />
                  </div>
                  <p className="text-xl text-gray-500 mt-6 font-medium">No products found</p>
                  <p className="text-gray-400 mt-2">
                    {searchTerm ? 'Try adjusting your search criteria' : 'No products have been assigned to you yet'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            // List View
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th 
                        onClick={() => handleSort('name')}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                          Product
                          <ArrowUpDown className="h-3 w-3 text-gray-400 group-hover:text-blue-600" />
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('sku')}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          SKU
                          <ArrowUpDown className="h-3 w-3 text-gray-400 group-hover:text-blue-600" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Category
                      </th>
                      <th 
                        onClick={() => handleSort('stock.current')}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          Stock
                          <ArrowUpDown className="h-3 w-3 text-gray-400 group-hover:text-blue-600" />
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('price')}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          Price
                          <ArrowUpDown className="h-3 w-3 text-gray-400 group-hover:text-blue-600" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.length > 0 ? (
                      products.map((product, index) => {
                        const stockStatus = getStockStatus(product);
                        return (
                          <tr 
                            key={product._id} 
                            className="hover:bg-blue-50 transition-colors animate-fade-in"
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mr-3">
                                  <Package className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                    {product.name}
                                  </div>
                                  {product.short_description && (
                                    <div className="text-xs text-gray-500 truncate max-w-xs">
                                      {product.short_description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded inline-block">
                                {product.sku}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <Layers className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-700">
                                  {product.category?.name || 'Uncategorized'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-2 h-2 rounded-full bg-${stockStatus.color}-500 animate-pulse`}></div>
                                    <span className={`text-sm font-semibold text-${stockStatus.color}-600`}>
                                      {product.stock?.current || 0} units
                                    </span>
                                  </div>
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full bg-gradient-to-r ${
                                        stockStatus.color === 'green' ? 'from-green-400 to-green-600' :
                                        stockStatus.color === 'yellow' ? 'from-yellow-400 to-orange-500' :
                                        stockStatus.color === 'red' ? 'from-red-400 to-red-600' :
                                        'from-gray-400 to-gray-600'
                                      }`}
                                      style={{ width: `${stockStatus.percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-bold text-gray-900">
                                  {product.price?.toFixed(2) || '0.00'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-md ${getStatusBadgeClass(product.status)}`}>
                                {product.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => handleViewProduct(product)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
                              >
                                <Eye className="h-4 w-4 flex-shrink-0" />
                                <span>View</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-16 text-center">
                          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-lg text-gray-500 font-medium">No products found</p>
                          <p className="text-gray-400 text-sm mt-1">
                            {searchTerm ? 'Try adjusting your search criteria' : 'No products have been assigned to you yet'}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-bold text-blue-600">
                        {(currentPage - 1) * (viewMode === 'grid' ? 12 : 10) + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-bold text-blue-600">
                        {Math.min(currentPage * (viewMode === 'grid' ? 12 : 10), pagination.totalProducts)}
                      </span>{' '}
                      of{' '}
                      <span className="font-bold text-blue-600">{pagination.totalProducts}</span>{' '}
                      products
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <ChevronLeft className="h-4 w-4 -ml-3" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={!pagination.hasPrevPage}
                      className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-lg font-medium transition-all ${
                              currentPage === pageNum
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      {pagination.totalPages > 5 && (
                        <>
                          <span className="px-2 text-gray-400">...</span>
                          <button
                            onClick={() => setCurrentPage(pagination.totalPages)}
                            className={`w-10 h-10 rounded-lg font-medium transition-all ${
                              currentPage === pagination.totalPages
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                            }`}
                          >
                            {pagination.totalPages}
                          </button>
                        </>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                      disabled={!pagination.hasNextPage}
                      className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(pagination.totalPages)}
                      disabled={currentPage === pagination.totalPages}
                      className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="h-4 w-4" />
                      <ChevronRight className="h-4 w-4 -ml-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Report Generation Modal */}
          {showReportModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                        <PieChart className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-bold">Generate Report</h3>
                    </div>
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Report Type Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        📊 Report Type
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { id: 'inventory', label: 'Complete Inventory', icon: '📦', desc: 'All products with full details' },
                          { id: 'low-stock', label: 'Low Stock Alert', icon: '⚠️', desc: 'Products running low' },
                          { id: 'out-of-stock', label: 'Out of Stock', icon: '❌', desc: 'Products that are empty' },
                          { id: 'active-products', label: 'Active Products', icon: '✅', desc: 'Only active products' }
                        ].map(type => (
                          <button
                            key={type.id}
                            onClick={() => setReportType(type.id)}
                            className={`p-4 border-2 rounded-xl text-left transition-all hover:shadow-md ${
                              reportType === type.id
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">{type.icon}</span>
                              <div>
                                <div className="font-medium text-gray-800">{type.label}</div>
                                <div className="text-sm text-gray-500">{type.desc}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Format Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        📄 Export Format
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'pdf', label: 'PDF Report', icon: <FileText className="h-5 w-5" />, color: 'red', desc: 'Professional PDF document' },
                          { id: 'excel', label: 'Excel File', icon: <FileSpreadsheet className="h-5 w-5" />, color: 'green', desc: 'Spreadsheet format' },
                          { id: 'csv', label: 'CSV File', icon: <Download className="h-5 w-5" />, color: 'blue', desc: 'Simple data export' }
                        ].map(format => (
                          <button
                            key={format.id}
                            onClick={() => setReportFormat(format.id)}
                            className={`p-4 border-2 rounded-xl text-center transition-all hover:shadow-md ${
                              reportFormat === format.id
                                ? `border-${format.color}-500 bg-${format.color}-50 shadow-md`
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className={`p-2 rounded-lg ${
                                reportFormat === format.id 
                                  ? `bg-${format.color}-100 text-${format.color}-600`
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {format.icon}
                              </div>
                              <span className="font-medium text-sm">{format.label}</span>
                              {reportFormat === format.id && (
                                <span className="text-xs text-gray-500 mt-1">{format.desc}</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Report Preview Stats */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        Report Preview
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {reportType === 'low-stock' 
                              ? stats.lowStockProducts
                              : reportType === 'out-of-stock'
                              ? stats.outOfStockProducts
                              : reportType === 'active-products'
                              ? stats.activeProducts
                              : stats.totalProducts}
                          </div>
                          <div className="text-xs text-gray-500">Items</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            ${products.reduce((sum, p) => {
                              if (reportType === 'low-stock' && !(p.stock?.current <= p.stock?.low_stock_threshold && p.stock?.current > 0)) return sum;
                              if (reportType === 'out-of-stock' && p.stock?.current !== 0) return sum;
                              if (reportType === 'active-products' && p.status !== 'active') return sum;
                              return sum + ((p.price || 0) * (p.stock?.current || 0));
                            }, 0).toFixed(0)}
                          </div>
                          <div className="text-xs text-gray-500">Value</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{stats.lowStockProducts}</div>
                          <div className="text-xs text-gray-500">Low Stock</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{stats.outOfStockProducts}</div>
                          <div className="text-xs text-gray-500">Out Stock</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Report will include {
                        reportType === 'low-stock' 
                          ? stats.lowStockProducts
                          : reportType === 'out-of-stock'
                          ? stats.outOfStockProducts
                          : reportType === 'active-products'
                          ? stats.activeProducts
                          : stats.totalProducts
                      } products
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowReportModal(false)}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={generateReport}
                        disabled={generatingReport}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {generatingReport ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4" />
                            Generate Report
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Product Details Modal */}
          {showDetailsModal && selectedProduct && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  handleCloseModal();
                }
              }}
            >
              <div 
                className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                        <Info className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-bold">Product Details</h3>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Image */}
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-64 flex items-center justify-center">
                      <Package className="h-24 w-24 text-gray-300" />
                    </div>

                    {/* Product Info */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-2xl font-bold text-gray-800">{selectedProduct.name}</h4>
                        <p className="text-gray-500 mt-1">{selectedProduct.short_description}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-md ${getStatusBadgeClass(selectedProduct.status)}`}>
                          {selectedProduct.status.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">SKU: <span className="font-mono font-bold">{selectedProduct.sku}</span></span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                            <span className="text-xs text-blue-600 font-medium">Sale Price</span>
                          </div>
                          <p className="text-2xl font-bold text-gray-800">
                            ${selectedProduct.price?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">Cost Price</span>
                          </div>
                          <p className="text-2xl font-bold text-gray-800">
                            ${selectedProduct.cost_price?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Stock Information */}
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4">
                      <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Box className="h-5 w-5 text-purple-600" />
                        Stock Information
                      </h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Current Stock:</span>
                          <span className="font-bold text-gray-800">{selectedProduct.stock?.current || 0} units</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Reserved:</span>
                          <span className="font-medium text-gray-700">{selectedProduct.stock?.reserved || 0} units</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Available:</span>
                          <span className="font-medium text-gray-700">{selectedProduct.stock?.available || 0} units</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Low Stock Alert:</span>
                          <span className="font-medium text-orange-600">{selectedProduct.stock?.low_stock_threshold || 0} units</span>
                        </div>
                      </div>
                    </div>

                    {/* Category & Details */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                      <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Layers className="h-5 w-5 text-green-600" />
                        Product Details
                      </h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Category:</span>
                          <span className="font-medium text-gray-800">{selectedProduct.category?.name || 'Uncategorized'}</span>
                        </div>
                        {selectedProduct.brand && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Brand:</span>
                            <span className="font-medium text-gray-800">{selectedProduct.brand}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Created:</span>
                          <span className="font-medium text-gray-800">
                            {new Date(selectedProduct.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Last Updated:</span>
                          <span className="font-medium text-gray-800">
                            {new Date(selectedProduct.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedProduct.description && (
                    <div className="mt-6 bg-gray-50 rounded-xl p-4">
                      <h5 className="font-semibold text-gray-800 mb-3">Description</h5>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {selectedProduct.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        // Add any additional action here
                        showInfo('Product details viewed');
                      }}
                      className="px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                    >
                      <ExternalLink className="h-4 w-4 inline mr-2" />
                      Open in Inventory
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
          animation-fill-mode: both;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </SupplierLayout>
  );
};

export default SupplierProducts;