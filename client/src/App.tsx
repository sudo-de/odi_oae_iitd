import { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {}
    }
  }, []);

  const handleLogin = (newToken: string, userData: any) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <div className="app">
      {isAuthenticated ? (
        <div>
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
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
