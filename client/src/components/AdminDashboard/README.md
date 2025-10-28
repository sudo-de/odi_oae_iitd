# AdminDashboard Component Structure

The AdminDashboard has been restructured into a modular, maintainable architecture with better separation of concerns.

## 📁 Folder Structure

```
AdminDashboard/
├── components/           # UI Components
│   ├── DashboardOverview.tsx
│   ├── UserManagement.tsx
│   ├── UserTable.tsx
│   ├── Settings.tsx
│   ├── CreateUserModal.tsx
│   ├── EditUserModal.tsx
│   ├── UserDetailsModal.tsx
│   └── NotificationContainer.tsx
├── hooks/               # Custom Hooks
│   ├── useUserManagement.ts
│   ├── useFormManagement.ts
│   ├── useModalManagement.ts
│   └── useMenuManagement.ts
├── types/               # TypeScript Types
│   └── index.ts
├── utils/               # Utility Functions
│   └── index.ts
├── index.tsx            # Main Component
└── AdminDashboard.css   # Styles
```

## 🧩 Components

### **DashboardOverview**
- Displays statistics cards (Total Users, Students, Drivers, Staff)
- Shows recent users activity list
- Clean, focused overview interface

### **UserManagement**
- Handles search and sorting functionality
- Contains the user table and create user button
- Manages user filtering and pagination

### **UserTable**
- Renders the users table with sortable columns
- Handles action menu (View, Edit, Activate/Deactivate, Delete)
- Responsive table design

### **Settings**
- System settings display
- Database status and configuration info
- Application version and environment details

### **Modals**
- **CreateUserModal**: Dynamic form for creating users based on role
- **EditUserModal**: Comprehensive edit form for all user types
- **UserDetailsModal**: Read-only view of complete user information

### **NotificationContainer**
- Toast notification system
- Success and error message display
- Auto-dismiss functionality

## 🎣 Custom Hooks

### **useUserManagement**
- Manages user data fetching and CRUD operations
- Handles API calls for create, update, delete, toggle status
- Manages loading states and error handling
- Notification system integration

### **useFormManagement**
- Form state management for create/edit operations
- Handles input changes for all field types
- File upload management
- Form validation and reset functionality

### **useModalManagement**
- Modal visibility state management
- User selection for editing/viewing
- Modal coordination and cleanup

### **useMenuManagement**
- Action menu positioning logic
- Click outside handling
- Smart menu positioning (top/bottom based on viewport)

## 📋 Types

### **User Interface**
- Complete user data structure
- Student-specific fields (hostel, emergency, disability)
- Driver-specific fields (QR code)
- File upload types

### **Form Data Types**
- CreateUserData interface
- SelectedFiles interface
- Notification interface

## 🛠️ Utils

### **formatDate**
- Date formatting utility
- Consistent date display across components

### **downloadFile**
- File download functionality
- Base64 to blob conversion
- Browser download handling

### **filterAndSortUsers**
- User filtering by search term
- Multi-column sorting
- Type-safe sorting logic

### **calculateStats**
- Statistics calculation
- User count by role
- Active user counting

## 🎯 Benefits

### **Maintainability**
- Single responsibility principle
- Easy to locate and modify specific functionality
- Clear separation of concerns

### **Reusability**
- Components can be reused in other parts of the application
- Hooks can be shared across components
- Utility functions are modular

### **Testability**
- Each component can be tested in isolation
- Hooks can be tested independently
- Clear interfaces make mocking easier

### **Performance**
- Smaller bundle sizes through code splitting
- Better tree shaking
- Reduced re-renders through focused state management

### **Developer Experience**
- Easier to understand and navigate
- Better TypeScript support
- Clearer error messages and debugging

## 🚀 Usage

The main AdminDashboard component now acts as a coordinator, using all the smaller components and hooks:

```tsx
import AdminDashboard from './components/AdminDashboard';

// Usage remains the same
<AdminDashboard token={token} user={user} />
```

The internal structure is now much more organized and maintainable while preserving the same external API.
