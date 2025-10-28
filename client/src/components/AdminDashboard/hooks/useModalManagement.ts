import { useState } from 'react';
import type { User } from '../types';

export const useModalManagement = () => {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [viewingFile, setViewingFile] = useState<{
    filename: string;
    mimetype: string;
    data: any;
  } | null>(null);

  const handleViewUser = (user: User) => {
    setViewingUser(user);
    setShowUserDetails(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditUser(true);
  };

  const closeAllModals = () => {
    setShowCreateUser(false);
    setShowEditUser(false);
    setShowUserDetails(false);
    setShowPhotoViewer(false);
    setShowDocumentViewer(false);
    setEditingUser(null);
    setViewingUser(null);
    setViewingFile(null);
  };

  return {
    showCreateUser,
    setShowCreateUser,
    showEditUser,
    setShowEditUser,
    showUserDetails,
    setShowUserDetails,
    showPhotoViewer,
    setShowPhotoViewer,
    showDocumentViewer,
    setShowDocumentViewer,
    editingUser,
    setEditingUser,
    viewingUser,
    setViewingUser,
    viewingFile,
    setViewingFile,
    handleViewUser,
    handleEditUser,
    closeAllModals
  };
};
