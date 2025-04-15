import { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider,
  UNSAFE_NavigationContext as NavigationContext,
  UNSAFE_DataRouterContext as DataRouterContext
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
// import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/toaster';
import { useAuth } from './contexts/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import JobsPage from './pages/Jobs';
import JobDetailsPage from './pages/JobDetails';
import MessagesPage from './pages/Messages';
import ProfilePage from './pages/Profile';
import NotFound from './pages/NotFound';
import About from './pages/About';
import Onboarding from '@/pages/Onboarding';
import RoleSelection from '@/pages/RoleSelection';
import OnboardingForm from '@/pages/OnboardingForm';
import CreatorDashboard from '@/pages/CreatorDashboard';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Chargement...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Si aucun rôle n'est spécifié, autoriser l'accès
  if (!allowedRoles) {
    return <>{children}</>;
  }
  
  // Vérifier si l'utilisateur a un des rôles autorisés
  if (!allowedRoles.includes(user.role)) {
    console.log('Access denied: user role not in allowed roles');
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

function AppLayout() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Chargement de l'application...</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['expert', 'creator']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute allowedRoles={['expert', 'creator']}>
              <MessagesPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['expert', 'creator']}>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/creator-dashboard" element={
            <ProtectedRoute allowedRoles={['creator']}>
              <CreatorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/onboarding-form" element={<OnboardingForm />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
