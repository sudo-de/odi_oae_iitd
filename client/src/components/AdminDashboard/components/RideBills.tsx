import React, { useState } from 'react';
import { formatDate } from '../utils';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface RideBill {
  id: string;
  studentName: string;
  studentEntryNumber?: string; // Entry number for students
  driverName: string;
  location: string; // e.g., "IIT Main Gate → IIT Hospital"
  fare: number;
  date: string;
  time: string;
  createdAt: string;
}

interface RideBillsProps {
  rides: RideBill[];
  loading?: boolean;
}

const RideBills: React.FC<RideBillsProps> = ({ rides, loading = false }) => {
  const [sortBy, setSortBy] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom'>('all');
  const [filterType, setFilterType] = useState<'all' | 'driver' | 'student'>('all');
  const [filterValue, setFilterValue] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const itemsPerPage = 10;

  // Get unique drivers and students for filters
  const uniqueDrivers = Array.from(new Set(rides.map(ride => ride.driverName)));
  const uniqueStudents = Array.from(new Set(rides.map(ride => ride.studentEntryNumber || ride.studentName)));

  // Get date range based on sortBy
  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (sortBy) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'yesterday':
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return { start: yesterday, end: today };
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { start: weekAgo, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { start: monthAgo, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'year':
        const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
        return { start: yearAgo, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'custom':
        // For custom, use the selected date range
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return { start, end };
        }
        return null; // If no dates selected, show all
      default:
        return null; // 'all' - no date filter
    }
  };

  // Filter and sort rides
  const dateRange = getDateRange();
  const filteredRides = rides
    .filter(ride => {
      let matchesFilter = true;
      if (filterType === 'driver') {
        matchesFilter = filterValue === 'all' || ride.driverName === filterValue;
      } else if (filterType === 'student') {
        const studentDisplay = ride.studentEntryNumber || ride.studentName;
        matchesFilter = filterValue === 'all' || studentDisplay === filterValue;
      }
      
      const studentDisplay = ride.studentEntryNumber || ride.studentName;
      const matchesSearch = searchTerm === '' || 
        ride.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        studentDisplay.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesDate = true;
      if (dateRange) {
        const rideDate = new Date(ride.date);
        rideDate.setHours(0, 0, 0, 0);
        const startDate = new Date(dateRange.start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        matchesDate = rideDate >= startDate && rideDate <= endDate;
      }
      
      return matchesFilter && matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      // Always sort by date descending (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  // Pagination
  const totalPages = Math.ceil(filteredRides.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRides = filteredRides.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterValue, searchTerm, sortBy, customStartDate, customEndDate]);

  // Reset filter value when filter type changes
  React.useEffect(() => {
    setFilterValue('all');
  }, [filterType]);

  // Calculate statistics (based on filtered results)
  const totalFare = filteredRides.reduce((sum, ride) => sum + ride.fare, 0);
  const averageFare = filteredRides.length > 0 ? totalFare / filteredRides.length : 0;
  const totalRides = filteredRides.length;
  const minFare = filteredRides.length > 0 ? Math.min(...filteredRides.map(r => r.fare)) : 0;
  const maxFare = filteredRides.length > 0 ? Math.max(...filteredRides.map(r => r.fare)) : 0;

  // View single ride on map
  const handleViewMap = (ride: RideBill) => {
    const parsed = ride.location.split('→');
    if (parsed.length === 2) {
      alert(`Map View for Ride #${ride.id}\n\nFrom: ${parsed[0].trim()}\nTo: ${parsed[1].trim()}\n\nThis will open a map showing the route.`);
    }
  };

  // Get filter labels for filename
  const getFilterLabel = () => {
    const parts: string[] = [];
    if (filterType === 'driver' && filterValue !== 'all') {
      parts.push(`Driver-${filterValue.replace(/\s+/g, '_')}`);
    } else if (filterType === 'student' && filterValue !== 'all') {
      parts.push(`Student-${filterValue.replace(/\s+/g, '_')}`);
    }
    const timeLabels: Record<string, string> = {
      'all': 'All_Time',
      'today': 'Today',
      'yesterday': 'Yesterday',
      'week': 'Last_Week',
      'month': 'Last_Month',
      'year': 'Last_Year',
      'custom': 'Custom_Range'
    };
    parts.push(timeLabels[sortBy] || 'All_Time');
    return parts.length > 0 ? `_${parts.join('_')}` : '';
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = filteredRides.map(ride => ({
        'Ride ID': ride.id,
        'Student Name (Entry No.)': ride.studentEntryNumber 
          ? `${ride.studentName} (${ride.studentEntryNumber})`
          : ride.studentName,
        'Driver Name': ride.driverName,
        'Location': ride.location,
        'Fare (₹)': ride.fare,
        'Date': formatDate(ride.date),
        'Time': ride.time
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 15 }, // Ride ID
        { wch: 20 }, // Student Name
        { wch: 20 }, // Driver Name
        { wch: 30 }, // Location
        { wch: 12 }, // Fare
        { wch: 12 }, // Date
        { wch: 10 }  // Time
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Ride Bills');

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filterLabel = getFilterLabel();
      const filename = `Ride_Bills_${timestamp}${filterLabel}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel. Please try again.');
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    try {
      if (filteredRides.length === 0) {
        alert('No rides to export. Please adjust your filters.');
        return;
      }

      // Use landscape orientation for better A4 formatting
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      
      // Add header with logo/icon area
      doc.setFillColor(102, 126, 234);
      doc.rect(0, 0, pageWidth, 25, 'F');
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Ride Bills Report', pageWidth / 2, 15, { align: 'center' });
      
      // Subtitle
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('IIT Delhi Campus Ride Service', pageWidth / 2, 22, { align: 'center' });
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Start table right after header
      let yPos = 35;

      // Prepare table data with better formatting
      const tableData = filteredRides.map(ride => {
        // Clean and truncate text to avoid encoding issues
        const cleanText = (text: string, maxLength: number) => {
          // Replace problematic characters that don't render well in PDF
          let cleaned = text
            .replace(/→/g, '->')  // Replace arrow with simple arrow for better PDF compatibility
            .replace(/['"`]/g, "'")  // Normalize quotes
            .trim();
          if (cleaned.length > maxLength) {
            cleaned = cleaned.substring(0, maxLength - 3) + '...';
          }
          return cleaned;
        };
        
        // Format: Name (Entry Number) or just Name
        const studentDisplay = ride.studentEntryNumber 
          ? `${ride.studentName} (${ride.studentEntryNumber})`
          : ride.studentName;
        
        return [
          ride.id,
          cleanText(studentDisplay, 40),
          cleanText(ride.driverName, 35),
          cleanText(ride.location, 50),
          `₹${ride.fare.toFixed(2)}`,
          formatDate(ride.date),
          ride.time
        ];
      });

      // Add table with better A4 formatting
      autoTable(doc, {
        head: [['Ride ID', 'Student Name (Entry No.)', 'Driver Name', 'Location', 'Fare', 'Date', 'Time']],
        body: tableData,
        startY: yPos,
        styles: { 
          fontSize: 6,
          cellPadding: 2,
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        headStyles: { 
          fillColor: [66, 139, 202], 
          textColor: 255, 
          fontStyle: 'bold',
          fontSize: 9
        },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        margin: { left: margin, right: margin, top: yPos },
        columnStyles: {
          0: { cellWidth: 25, halign: 'left' },
          1: { cellWidth: 45, halign: 'left' },
          2: { cellWidth: 40, halign: 'left' },
          3: { cellWidth: 70, halign: 'left' },
          4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 30, halign: 'center' },
          6: { cellWidth: 25, halign: 'center' }
        },
        tableWidth: 'wrap',
        showHead: 'everyPage',
        showFoot: 'never',
        pageBreak: 'auto',
        rowPageBreak: 'avoid'
      });

      // Add footer on all pages
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        doc.setTextColor(0, 0, 0);
      }

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filterLabel = getFilterLabel();
      const filename = `Ride_Bills_${timestamp}${filterLabel}.pdf`;

      // Save file
      doc.save(filename);
    } catch (error: any) {
      console.error('Error exporting to PDF:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      console.error('Full error details:', {
        message: errorMessage,
        stack: error?.stack,
        name: error?.name
      });
      alert(`Failed to export to PDF: ${errorMessage}\n\nPlease check the browser console for more details.`);
    }
  };

  if (loading) {
    return (
      <div className="ride-bills">
        <div className="loading-state">Loading ride bills...</div>
      </div>
    );
  }

  return (
    <div className="ride-bills">
      {/* Statistics */}
      <div className="ride-bills-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Rides</h3>
            <div className="stat-number">{totalRides}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <div className="stat-number">₹{totalFare.toFixed(2)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Average Fare</h3>
            <div className="stat-number">₹{averageFare.toFixed(2)}</div>
            {filteredRides.length > 0 && (
              <div className="stat-subtitle">Range: ₹{minFare.toFixed(2)} - ₹{maxFare.toFixed(2)}</div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="ride-bills-controls">
        <div className="search-group">
          <label htmlFor="ride-search">Search:</label>
          <input
            id="ride-search"
            type="text"
            placeholder="Search by ID, student, driver, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="filter-type">Filter by:</label>
          <select
            id="filter-type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'driver' | 'student')}
          >
            <option value="all">All</option>
            <option value="driver">Driver</option>
            <option value="student">Student</option>
          </select>
        </div>
        {filterType !== 'all' && (
          <div className="filter-group">
            <label htmlFor="filter-value">Select {filterType === 'driver' ? 'Driver' : 'Student'}:</label>
            <select
              id="filter-value"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            >
              <option value="all">All {filterType === 'driver' ? 'Drivers' : 'Students'}</option>
              {(filterType === 'driver' ? uniqueDrivers : uniqueStudents).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="sort-group">
          <label htmlFor="sort-by">Time Period:</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom');
              // Reset custom dates when switching away from custom
              if (e.target.value !== 'custom') {
                setCustomStartDate('');
                setCustomEndDate('');
              }
            }}
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        {sortBy === 'custom' && (
          <div className="custom-date-range">
            <div className="date-input-group">
              <label htmlFor="start-date">From:</label>
              <input
                id="start-date"
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                max={customEndDate || new Date().toISOString().split('T')[0]}
                className="date-input"
              />
            </div>
            <div className="date-input-group">
              <label htmlFor="end-date">To:</label>
              <input
                id="end-date"
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                min={customStartDate}
                max={new Date().toISOString().split('T')[0]}
                className="date-input"
              />
            </div>
          </div>
        )}
        {(searchTerm || filterType !== 'all' || filterValue !== 'all' || sortBy !== 'all' || customStartDate || customEndDate) && (
          <button
            className="clear-filters-btn"
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setFilterValue('all');
              setSortBy('all');
              setCustomStartDate('');
              setCustomEndDate('');
            }}
            title="Clear all filters"
          >
            Clear Filters
          </button>
        )}
        <div className="export-group">
          <button
            className="export-btn excel"
            onClick={exportToExcel}
            disabled={filteredRides.length === 0}
            title="Export to Excel"
          >
            📊 Export Excel
          </button>
          <button
            className="export-btn pdf"
            onClick={exportToPDF}
            disabled={filteredRides.length === 0}
            title="Export to PDF"
          >
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* Results Count */}
      {filteredRides.length !== rides.length && (
        <div className="results-count">
          Showing {filteredRides.length} of {rides.length} rides
        </div>
      )}

      {/* Ride Bills Table */}
      <div className="ride-bills-table-container">
        {filteredRides.length > 0 ? (
          <>
            <table className="ride-bills-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student Name (Entry No.)</th>
                  <th>Driver Name</th>
                  <th>Location</th>
                  <th>Fare</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRides.map((ride) => (
                  <tr key={ride.id}>
                    <td className="ride-id" title={ride.id}>#{ride.id}</td>
                    <td className="student-name">
                      {ride.studentName}
                      {ride.studentEntryNumber && (
                        <span className="student-name-subtitle"> ({ride.studentEntryNumber})</span>
                      )}
                    </td>
                    <td className="driver-name">{ride.driverName}</td>
                    <td className="location" title={ride.location}>{ride.location}</td>
                    <td className="fare">₹{ride.fare.toFixed(2)}</td>
                    <td className="date">{formatDate(ride.date)}</td>
                    <td className="time">{ride.time}</td>
                    <td className="view-actions">
                      <button
                        className="action-btn map-btn"
                        onClick={() => handleViewMap(ride)}
                        title="View on Map"
                      >
                        🗺️ Map
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  ← Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-rides">
            <div className="no-rides-icon">🚕</div>
            <h4>No ride bills found</h4>
            <p>
              {searchTerm || filterType !== 'all' || filterValue !== 'all' || sortBy !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No rides have been recorded yet'}
            </p>
            {(searchTerm || filterType !== 'all' || filterValue !== 'all' || sortBy !== 'all') && (
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterValue('all');
                  setSortBy('all');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RideBills;

