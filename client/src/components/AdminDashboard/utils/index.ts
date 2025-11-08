import type { User, ViewingFile } from '../types';

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

export const downloadFile = (file: ViewingFile) => {
  try {
    // Convert base64 data to blob
    const byteCharacters = atob(file.data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: file.mimetype });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Failed to download file');
  }
};

// Helper function to parse QR code/barcode data
const parseQRCodeData = (searchTerm: string): { driverId?: string; email?: string; name?: string } | null => {
  try {
    // Try to parse as JSON (QR code format)
    // Remove any whitespace that might interfere
    const trimmed = searchTerm.trim();
    const parsed = JSON.parse(trimmed);
    
    // Check if it has QR code structure
    if (parsed && (typeof parsed === 'object') && (parsed.driverId || parsed.email || parsed.name)) {
      return {
        driverId: parsed.driverId ? String(parsed.driverId) : undefined,
        email: parsed.email ? String(parsed.email) : undefined,
        name: parsed.name ? String(parsed.name) : undefined
      };
    }
  } catch (e) {
    // Not JSON, continue with regular search
  }
  return null;
};

export const filterAndSortUsers = (users: User[], searchTerm: string, sortBy: keyof User, sortOrder: 'asc' | 'desc') => {
  if (!searchTerm.trim()) {
    // No search term, return all users sorted
    return users.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  }

  const qrData = parseQRCodeData(searchTerm);
  const searchLower = searchTerm.toLowerCase();

  return users
    .filter(user => {
      // If QR code data is detected, search by those fields
      if (qrData) {
        let matches = false;
        
        // Check driverId (exact match)
        if (qrData.driverId) {
          const userId = String(user._id);
          const searchId = String(qrData.driverId);
          if (userId === searchId || userId.includes(searchId) || searchId.includes(userId)) {
            matches = true;
          }
        }
        
        // Check email (partial match)
        if (qrData.email && user.email) {
          const userEmail = user.email.toLowerCase();
          const searchEmail = qrData.email.toLowerCase();
          if (userEmail === searchEmail || userEmail.includes(searchEmail) || searchEmail.includes(userEmail)) {
            matches = true;
          }
        }
        
        // Check name (partial match)
        if (qrData.name && user.name) {
          const userName = user.name.toLowerCase();
          const searchName = qrData.name.toLowerCase();
          if (userName === searchName || userName.includes(searchName) || searchName.includes(userName)) {
            matches = true;
          }
        }
        
        return matches;
      }

      // Regular search - check multiple fields
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        String(user._id).toLowerCase().includes(searchLower) ||
        (user.entryNumber && user.entryNumber.toLowerCase().includes(searchLower)) ||
        (user.udidNumber && user.udidNumber.toLowerCase().includes(searchLower)) ||
        (user.phone && `${user.phone.countryCode}${user.phone.number}`.includes(searchTerm.replace(/\s+/g, ''))) ||
        (user.qrCode && user.qrCode.includes(searchTerm)) // Search in QR code data URL
      );
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
};

export const calculateStats = (users: User[]) => {
  return {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    studentUsers: users.filter(u => u.role === 'student').length,
    driverUsers: users.filter(u => u.role === 'driver').length,
    staffUsers: users.filter(u => u.role === 'staff').length,
  };
};
