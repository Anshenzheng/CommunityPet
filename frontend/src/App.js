import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerLayout from './components/OwnerLayout';
import AdminLayout from './components/AdminLayout';
import PetList from './pages/owner/PetList';
import AddPet from './pages/owner/AddPet';
import AdminPetList from './pages/admin/AdminPetList';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        {user.role === 'owner' ? (
          <Route path="/" element={<OwnerLayout user={user} onLogout={handleLogout} />}>
            <Route index element={<Navigate to="/my-pets" replace />} />
            <Route path="my-pets" element={<PetList user={user} />} />
            <Route path="add-pet" element={<AddPet user={user} />} />
            <Route path="*" element={<Navigate to="/my-pets" replace />} />
          </Route>
        ) : (
          <Route path="/" element={<AdminLayout user={user} onLogout={handleLogout} />}>
            <Route index element={<Navigate to="/admin/pets" replace />} />
            <Route path="admin/pets" element={<AdminPetList />} />
            <Route path="*" element={<Navigate to="/admin/pets" replace />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
}

export default App;
