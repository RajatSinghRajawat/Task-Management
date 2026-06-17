import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={
          localStorage.getItem('adminToken') ? <Navigate to="/" replace /> : <Login />
        } />
        
        {/* Protected Dashboard Route */}
        <Route path="/" element={
          localStorage.getItem('adminToken') ? <Dashboard /> : <Navigate to="/login" replace />
        } />

        {/* Fallback redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
