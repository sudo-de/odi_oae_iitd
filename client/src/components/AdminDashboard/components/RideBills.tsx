import React, { useState, useMemo, useCallback, memo } from 'react';
import { formatDate } from '../utils';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface RideBill {
  id: string;
  studentName: string;
  studentEntryNumber?: string;
  driverName: string;
  location: string;
  fare: number;
  date: string;
  time: string;
  createdAt: string;
}

interface RideBillsProps {
  rides: RideBill[];
  loading?: boolean;
  onToggleSidebar?: () => void;
}

// Stat Card Component
const StatCard = memo(({ icon, label, value, subtitle, variant }: {
  icon: string;
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: string;
}) => (
  <div className={`rb-stat-card ${variant || ''}`}>
    <div className="stat-icon-wrapper">
      <span className="stat-icon">{icon}</span>
    </div>
    <div className="stat-info">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {subtitle && <span className="stat-subtitle">{subtitle}</span>}
    </div>
  </div>
));

// Table Row Component
const RideRow = memo(({ ride }: { ride: RideBill }) => (
  <tr>
    <td className="ride-id">
      <span className="id-badge">#{ride.id}</span>
    </td>
    <td className="student-cell">
      <div className="student-info">
        <span className="student-name">{ride.studentName}</span>
        {ride.studentEntryNumber && (
          <span className="entry-number">{ride.studentEntryNumber}</span>
        )}
      </div>
    </td>
    <td className="driver-cell">
      <span className="driver-badge">🚗 {ride.driverName}</span>
    </td>
    <td className="location-cell">
      <span className="location-text" title={ride.location}>{ride.location}</span>
    </td>
    <td className="fare-cell">
      <span className="fare-badge">₹{ride.fare.toFixed(2)}</span>
    </td>
    <td className="date-cell">{formatDate(ride.date)}</td>
    <td className="time-cell">{ride.time}</td>
  </tr>
));

const RideBills: React.FC<RideBillsProps> = ({ rides, loading = false, onToggleSidebar }) => {
  const [sortBy, setSortBy] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom'>('all');
  const [filterType, setFilterType] = useState<'all' | 'driver' | 'student'>('all');
  const [filterValue, setFilterValue] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const itemsPerPage = 10;

  // Unique values for filters
  const { uniqueDrivers, uniqueStudents } = useMemo(() => ({
    uniqueDrivers: Array.from(new Set(rides.map(ride => ride.driverName))),
    uniqueStudents: Array.from(new Set(rides.map(ride => ride.studentEntryNumber || ride.studentName)))
  }), [rides]);

  // Date range calculation
  const getDateRange = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (sortBy) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'yesterday':
        return { start: new Date(today.getTime() - 24 * 60 * 60 * 1000), end: today };
      case 'week':
        return { start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'month':
        return { start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'year':
        return { start: new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000), end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'custom':
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return { start, end };
        }
        return null;
      default:
        return null;
    }
  }, [sortBy, customStartDate, customEndDate]);

  // Filter rides
  const filteredRides = useMemo(() => {
  const dateRange = getDateRange();
    
    return rides
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
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [rides, filterType, filterValue, searchTerm, getDateRange]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredRides.length;
    const fares = filteredRides.map(r => r.fare);
    const totalFare = fares.reduce((sum, f) => sum + f, 0);
    const avgFare = total > 0 ? totalFare / total : 0;
    const minFare = total > 0 ? Math.min(...fares) : 0;
    const maxFare = total > 0 ? Math.max(...fares) : 0;
    return { total, totalFare, avgFare, minFare, maxFare };
  }, [filteredRides]);

  // Pagination
  const { totalPages, paginatedRides } = useMemo(() => {
    const total = Math.ceil(filteredRides.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    return {
      totalPages: total,
      paginatedRides: filteredRides.slice(start, start + itemsPerPage)
    };
  }, [filteredRides, currentPage]);

  // Reset page on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterValue, searchTerm, sortBy, customStartDate, customEndDate]);

  React.useEffect(() => {
    setFilterValue('all');
  }, [filterType]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterType('all');
    setFilterValue('all');
    setSortBy('all');
    setCustomStartDate('');
    setCustomEndDate('');
  }, []);

  const getFilterLabel = useCallback(() => {
    const parts: string[] = [];
    if (filterType === 'driver' && filterValue !== 'all') {
      parts.push(`Driver-${filterValue.replace(/\s+/g, '_')}`);
    } else if (filterType === 'student' && filterValue !== 'all') {
      parts.push(`Student-${filterValue.replace(/\s+/g, '_')}`);
    }
    const timeLabels: Record<string, string> = {
      'all': 'All_Time', 'today': 'Today', 'yesterday': 'Yesterday',
      'week': 'Last_Week', 'month': 'Last_Month', 'year': 'Last_Year', 'custom': 'Custom_Range'
    };
    parts.push(timeLabels[sortBy] || 'All_Time');
    return parts.length > 0 ? `_${parts.join('_')}` : '';
  }, [filterType, filterValue, sortBy]);

  const exportToExcel = useCallback(() => {
    try {
      const excelData = filteredRides.map(ride => ({
        'Ride ID': ride.id,
        'Student Name (Entry No.)': ride.studentEntryNumber 
          ? `${ride.studentName} (${ride.studentEntryNumber})` : ride.studentName,
        'Driver Name': ride.driverName,
        'Location': ride.location,
        'Fare (₹)': ride.fare,
        'Date': formatDate(ride.date),
        'Time': ride.time
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      ws['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Ride Bills');

      const timestamp = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Ride_Bills_${timestamp}${getFilterLabel()}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel. Please try again.');
    }
  }, [filteredRides, getFilterLabel]);

  const exportToPDF = useCallback(() => {
    try {
      if (filteredRides.length === 0) {
        alert('No rides to export.');
        return;
      }

      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      doc.setFillColor(102, 126, 234);
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Ride Bills Report', pageWidth / 2, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('IIT Delhi Campus Ride Service', pageWidth / 2, 22, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      
      const tableData = filteredRides.map(ride => {
        const cleanText = (text: string, max: number) => {
          let c = text.replace(/→/g, '->').replace(/['"`]/g, "'").trim();
          return c.length > max ? c.substring(0, max - 3) + '...' : c;
        };
        const studentDisplay = ride.studentEntryNumber 
          ? `${ride.studentName} (${ride.studentEntryNumber})` : ride.studentName;
        return [
          ride.id, cleanText(studentDisplay, 40), cleanText(ride.driverName, 35),
          cleanText(ride.location, 50), `Rs.${ride.fare.toFixed(2)}`, formatDate(ride.date), ride.time
        ];
      });

      autoTable(doc, {
        head: [['Ride ID', 'Student Name (Entry No.)', 'Driver Name', 'Location', 'Fare', 'Date', 'Time']],
        body: tableData,
        startY: 35,
        styles: { fontSize: 6, cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        margin: { left: 15, right: 15 },
        columnStyles: {
          0: { cellWidth: 25 }, 1: { cellWidth: 45 }, 2: { cellWidth: 40 },
          3: { cellWidth: 70 }, 4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 30, halign: 'center' }, 6: { cellWidth: 25, halign: 'center' }
        },
        showHead: 'everyPage', pageBreak: 'auto', rowPageBreak: 'avoid'
      });

      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      const timestamp = new Date().toISOString().split('T')[0];
      doc.save(`Ride_Bills_${timestamp}${getFilterLabel()}.pdf`);
    } catch (error: any) {
      console.error('Error exporting to PDF:', error);
      alert(`Failed to export to PDF: ${error?.message || 'Unknown error'}`);
    }
  }, [filteredRides, getFilterLabel]);

  const hasActiveFilters = searchTerm || filterType !== 'all' || filterValue !== 'all' || sortBy !== 'all' || customStartDate || customEndDate;

  if (loading) {
    return (
      <div className="ride-bills">
        <div className="rb-loading">
          <div className="loading-spinner"></div>
          <span>Loading ride bills...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="ride-bills">
      {/* Banner */}
      <div className="rb-banner">
        <div className="banner-header">
          {onToggleSidebar && (
            <button className="mobile-menu-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
              ☰
            </button>
          )}
          <div className="header-icon">🧾</div>
          <div className="header-text">
            <h2>Ride Bills</h2>
            <p>View and export ride transaction records</p>
          </div>
          <div className="export-buttons">
            <button className="export-btn excel" onClick={exportToExcel} disabled={filteredRides.length === 0}>
              📊 Excel
            </button>
            <button className="export-btn pdf" onClick={exportToPDF} disabled={filteredRides.length === 0}>
              📄 PDF
            </button>
          </div>
        </div>
        <div className="banner-stats">
          <StatCard icon="🚕" label="Total Rides" value={stats.total} />
          <StatCard icon="💰" label="Total Revenue" value={`₹${stats.totalFare.toFixed(0)}`} />
          <StatCard icon="📈" label="Avg Fare" value={`₹${stats.avgFare.toFixed(0)}`} />
          <StatCard icon="📊" label="Range" value={`₹${stats.minFare} - ₹${stats.maxFare}`} />
        </div>
      </div>

      {/* Filters */}
      <div className="rb-filters">
        <div className="filter-row">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
          <input
            type="text"
              placeholder="Search by ID, student, driver, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
            {searchTerm && (
              <button className="clear-input" onClick={() => setSearchTerm('')}>×</button>
            )}
        </div>

          <div className="filter-select">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
            <option value="all">All</option>
              <option value="driver">By Driver</option>
              <option value="student">By Student</option>
          </select>
        </div>

        {filterType !== 'all' && (
            <div className="filter-select">
              <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)}>
              <option value="all">All {filterType === 'driver' ? 'Drivers' : 'Students'}</option>
                {(filterType === 'driver' ? uniqueDrivers : uniqueStudents).map(item => (
                  <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        )}

          <div className="filter-select time-filter">
            <select value={sortBy} onChange={(e) => {
              setSortBy(e.target.value as any);
              if (e.target.value !== 'custom') {
                setCustomStartDate('');
                setCustomEndDate('');
              }
            }}>
              <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={handleClearFilters}>
              ✕ Clear
            </button>
          )}
        </div>

        {sortBy === 'custom' && (
          <div className="custom-date-row">
            <div className="date-input-wrapper">
              <label>From</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                max={customEndDate || new Date().toISOString().split('T')[0]}
              />
            </div>
            <span className="date-separator">→</span>
            <div className="date-input-wrapper">
              <label>To</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                min={customStartDate}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        )}

        {filteredRides.length !== rides.length && (
          <div className="results-info">
            Showing {filteredRides.length} of {rides.length} rides
        </div>
        )}
      </div>

      {/* Table */}
      <div className="rb-table-container">
        {filteredRides.length > 0 ? (
          <>
            <table className="rb-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Driver</th>
                  <th>Route</th>
                  <th>Fare</th>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRides.map(ride => (
                  <RideRow key={ride.id} ride={ride} />
                ))}
              </tbody>
            </table>
            
            {totalPages > 1 && (
              <div className="rb-pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ← Prev
                </button>
                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rb-empty">
            <div className="empty-icon">🚕</div>
            <h3>No ride bills found</h3>
            <p>{hasActiveFilters ? 'Try adjusting your filters' : 'No rides recorded yet'}</p>
            {hasActiveFilters && (
              <button className="btn-clear" onClick={handleClearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(RideBills);
