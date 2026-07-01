import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TeacherLayout from './layouts/TeacherLayout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/tasks/Tasks';
import Students from './pages/students/Students';
import Reports from './pages/reports/Reports';
import Materials from './pages/materials/Materials';
import Notifications from './pages/Notifications';
import Profile from './pages/profile/Profile';
import TaskDetail from './pages/tasks/TaskDetail';
import StudentDetail from './pages/students/StudentDetail';
import CreateTask from './pages/tasks/CreateTask';
import Login from './components/Login';
import Register from './components/Register';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        
        <Route path="/" element={<ProtectedRoute><TeacherLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/create" element={<CreateTask />} />
          <Route path="tasks/edit/:id" element={<CreateTask />} />
          <Route path="tasks/:id" element={<TaskDetail />} />
          <Route path="students" element={<Students />} />
          <Route path="students/:id" element={<StudentDetail />} />
          <Route path="reports" element={<Reports />} />
          <Route path="materials" element={<Materials />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
