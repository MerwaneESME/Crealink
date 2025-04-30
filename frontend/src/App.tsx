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
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from './config/firebase';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetailsPage from './pages/JobDetails';
import MessagesPage from './pages/Messages';
import ProfilePage from './pages/Profile';
import NotFound from './pages/NotFound';
import About from './pages/About';
import Onboarding from '@/pages/Onboarding';
import RoleSelection from '@/pages/RoleSelection';
import OnboardingForm from '@/pages/OnboardingForm';
import CreatorDashboard from '@/pages/CreatorDashboard';
import Portfolio from '@/pages/Portfolio';
import DebugJobs from '@/pages/DebugJobs';
import ExpertPortfolio from '@/pages/ExpertPortfolio';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, loading } = useAuth();
  
  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - Allowed roles:', allowedRoles);
  
  if (loading) {
    return <div>Chargement...</div>;
  }
  
  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" />;
  }
  
  // Si aucun rôle n'est spécifié, autoriser l'accès
  if (!allowedRoles) {
    console.log('ProtectedRoute - No roles specified, allowing access');
    return <>{children}</>;
  }
  
  // Vérifier si l'utilisateur a un des rôles autorisés
  if (!allowedRoles.includes(user.role)) {
    console.log('ProtectedRoute - Access denied: user role not in allowed roles');
    console.log('User role:', user.role);
    console.log('Allowed roles:', allowedRoles);
    return <Navigate to="/" />;
  }
  
  console.log('ProtectedRoute - Access granted');
  return <>{children}</>;
};

// Redirection intelligente en fonction du rôle
const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user.role === 'expert') {
    return <Navigate to="/portfolio" />;
  } else if (user.role === 'creator') {
    return <Navigate to="/creator-dashboard" />;
  }
  
  return <Navigate to="/" />;
};

function AppLayout() {
  const { user, loading } = useAuth();
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  useEffect(() => {
    // Vérifier la connexion à Firebase au démarrage
    const checkFirebaseConnection = async () => {
      try {
        console.log("Vérification de la connexion à Firebase...");
        // Essayer de lire n'importe quelle collection
        const testQuery = query(collection(db, 'users'), limit(1));
        await getDocs(testQuery);
        console.log("Connexion à Firebase établie avec succès");
        setDbStatus('connected');
      } catch (error: any) {
        console.error("Erreur de connexion à Firebase:", error);
        setDbStatus('error');
        setErrorMsg(error.message);
      }
    };
    
    checkFirebaseConnection();
  }, []);
  
  if (loading) {
    return <div>Chargement de l'application...</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {dbStatus === 'error' && (
          <div className="bg-red-900/30 text-red-400 p-4 text-center text-sm">
            Problème de connexion à la base de données: {errorMsg}
          </div>
        )}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/debug-jobs" element={<DebugJobs />} />
          
          {/* Routes protégées */}
          <Route path="/jobs" element={
            <ProtectedRoute allowedRoles={['expert', 'creator']}>
              <Jobs />
            </ProtectedRoute>
          } />
          <Route path="/jobs/:id" element={
            <ProtectedRoute allowedRoles={['expert', 'creator']}>
              <JobDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/expert/:id" element={
            <ProtectedRoute allowedRoles={['expert', 'creator']}>
              <ExpertPortfolio />
            </ProtectedRoute>
          } />
          
          {/* Route de redirection intelligente */}
          <Route path="/dashboard" element={<DashboardRedirect />} />
          
          {/* Routes protégées spécifiques aux rôles */}
          <Route path="/portfolio" element={
            <ProtectedRoute allowedRoles={['expert']}>
              <Portfolio />
            </ProtectedRoute>
          } />
          <Route path="/creator-dashboard" element={
            <ProtectedRoute allowedRoles={['creator']}>
              <CreatorDashboard />
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
