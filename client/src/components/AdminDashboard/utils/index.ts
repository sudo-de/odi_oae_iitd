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

export const filterAndSortUsers = (users: User[], searchTerm: string, sortBy: keyof User, sortOrder: 'asc' | 'desc') => {
  return users
    .filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
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
