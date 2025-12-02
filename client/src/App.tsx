import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import DriverVerification from './components/DriverVerification';
import './App.css';

// Redirect component for root path
const RootRedirect = () => {
  const savedToken = localStorage.getItem('token');
  
  if (savedToken) {
    // If logged in, go to dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  // If not logged in, redirect to external OAE website
  useEffect(() => {
    window.location.href = 'http://localhost:5173/'; // OAE website URL
  }, []);
  
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#000000',
      color: '#ffffff'
    }}>
      Redirecting to OAE...
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
      
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
    if (savedUser) {
      try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error('Error parsing saved user:', e);
        }
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (newToken: string, userData: any) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="app" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        background: '#000000'
      }}>
        <div style={{ 
          color: '#ffffff', 
          fontSize: '1.2rem',
          textAlign: 'center'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
    <div className="app" style={{ width: '100%', minHeight: '100vh' }}>
        <Routes>
          {/* Root path - redirect to OAE or dashboard */}
          <Route path="/" element={<RootRedirect />} />
          
          {/* Login page */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            } 
          />
          
          {/* Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
        <div style={{ width: '100%', minHeight: '100vh' }}>
          {user?.role === 'admin' ? (
            <AdminDashboard token={token!} user={user} />
          ) : (
            <div className="dashboard">
              <h2>Welcome, {user?.name}!</h2>
              <p>You are logged in as: <strong>{user?.role}</strong></p>
              <p>Email: {user?.email}</p>
            </div>
          )}
        </div>
      ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Driver Verification (Public) */}
          <Route path="/verify-driver/:id" element={<DriverVerification />} />
          
          {/* Catch all - redirect to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </div>
    </BrowserRouter>
  );
}

export default App;
