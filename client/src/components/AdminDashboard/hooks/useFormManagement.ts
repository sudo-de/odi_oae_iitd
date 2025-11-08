import { useState } from 'react';
import type { CreateUserData, SelectedFiles } from '../types';

export const useFormManagement = () => {
  const [createUserData, setCreateUserData] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    isActive: true,
    phone: {
      countryCode: '+91',
      number: ''
    },
    // Student fields
    entryNumber: '',
    programme: '',
    department: '',
    hostel: {
      name: '',
      roomNo: ''
    },
    emergencyDetails: {
      name: '',
      address: '',
      phone: '',
      additionalPhone: ''
    },
    disabilityType: '',
    udidNumber: '',
    disabilityPercentage: 0,
    expiryDate: '',
    // Driver fields
    qrCode: ''
  });

  const [selectedFiles, setSelectedFiles] = useState<SelectedFiles>({
    profilePhoto: null,
    disabilityDocument: null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setCreateUserData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'profilePhoto' | 'disabilityDocument') => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFiles(prev => ({
        ...prev,
        [fileType]: file
      }));
    }
  };

  const handlePhoneChange = (field: 'countryCode' | 'number', value: string) => {
    setCreateUserData(prev => ({
      ...prev,
      phone: {
        ...prev.phone,
        [field]: value
      }
    }));
  };

  const handleHostelChange = (field: 'name' | 'roomNo', value: string) => {
    setCreateUserData(prev => ({
      ...prev,
      hostel: {
        ...prev.hostel,
        [field]: value
      }
    }));
  };

  const handleEmergencyChange = (field: 'name' | 'address' | 'phone' | 'additionalPhone', value: string) => {
    setCreateUserData(prev => ({
      ...prev,
      emergencyDetails: {
        ...prev.emergencyDetails,
        [field]: value
      }
    }));
  };

  const resetFormForRole = (role: string) => {
    const baseData: CreateUserData = {
      name: '',
      email: '',
      password: '',
      role: role,
      isActive: true,
      phone: {
        countryCode: '+91',
        number: ''
      },
      entryNumber: '',
      programme: '',
      department: '',
      hostel: {
        name: '',
        roomNo: ''
      },
      emergencyDetails: {
        name: '',
        address: '',
        phone: '',
        additionalPhone: ''
      },
      disabilityType: '',
      udidNumber: '',
      disabilityPercentage: 0,
      expiryDate: '',
      qrCode: ''
    };

    setCreateUserData(baseData);
    setSelectedFiles({
      profilePhoto: null,
      disabilityDocument: null
    });
  };

  const resetForm = () => {
    setCreateUserData({
      name: '',
      email: '',
      password: '',
      role: 'student',
      isActive: true,
      entryNumber: '',
      programme: '',
      department: '',
      hostel: {
        name: '',
        roomNo: ''
      },
      emergencyDetails: {
        name: '',
        address: '',
        phone: '',
        additionalPhone: ''
      },
      phone: {
        countryCode: '+91',
        number: ''
      },
      disabilityType: '',
      udidNumber: '',
      disabilityPercentage: 0,
      expiryDate: '',
      qrCode: ''
    });
    setSelectedFiles({
      profilePhoto: null,
      disabilityDocument: null
    });
  };

  return {
    createUserData,
    setCreateUserData,
    selectedFiles,
    setSelectedFiles,
    handleInputChange,
    handleFileChange,
    handlePhoneChange,
    handleHostelChange,
    handleEmergencyChange,
    resetFormForRole,
    resetForm
  };
};
