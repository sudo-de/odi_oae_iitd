import { useState, useEffect } from 'react';

export const useMenuManagement = () => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>('bottom');

  const toggleMenu = (userId: string, event: React.MouseEvent) => {
    if (activeMenuId === userId) {
      setActiveMenuId(null);
      return;
    }

    // Calculate available space below the button
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const menuHeight = 200; // Approximate menu height

    // Determine if menu should open above or below
    const shouldOpenAbove = spaceBelow < menuHeight && buttonRect.top > menuHeight;
    
    setMenuPosition(shouldOpenAbove ? 'top' : 'bottom');
    setActiveMenuId(userId);
  };

  const closeMenu = () => {
    setActiveMenuId(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenuId) {
        const target = event.target as HTMLElement;
        if (!target.closest('.action-menu-container')) {
          closeMenu();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuId]);

  return {
    activeMenuId,
    menuPosition,
    toggleMenu,
    closeMenu
  };
};
