export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  age?: number;
  isActive: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  
  // Common fields for all user types
  phone?: {
    countryCode: string;
    number: string;
  };
  profilePhoto?: {
    filename: string;
    mimetype: string;
    size: number;
    data: any; // Use any instead of Buffer for client-side
  };

  // Student-specific fields
  entryNumber?: string;
  programme?: string;
  department?: string;
  hostel?: {
    name: string;
    roomNo: string;
  };
  emergencyDetails?: {
    name: string;
    address: string;
    phone: string;
    additionalPhone: string;
  };
  disabilityType?: string;
  udidNumber?: string;
  disabilityPercentage?: number;
  disabilityDocument?: {
    filename: string;
    mimetype: string;
    size: number;
    data: any; // Use any instead of Buffer for client-side
  };
  expiryDate?: string;
  isExpired?: boolean;

  // Driver-specific fields
  qrCode?: string;
}

export interface AdminDashboardProps {
  token: string;
  user: any;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  phone: {
    countryCode: string;
    number: string;
  };
  // Student fields
  entryNumber: string;
  programme: string;
  department: string;
  hostel: {
    name: string;
    roomNo: string;
  };
  emergencyDetails: {
    name: string;
    address: string;
    phone: string;
    additionalPhone: string;
  };
  disabilityType: string;
  udidNumber: string;
  disabilityPercentage: number;
  expiryDate: string;
  // Driver fields
  qrCode: string;
}

export interface SelectedFiles {
  profilePhoto: File | null;
  disabilityDocument: File | null;
}

export interface Notification {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export interface ViewingFile {
  filename: string;
  mimetype: string;
  data: any;
}
