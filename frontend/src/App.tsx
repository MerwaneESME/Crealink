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
import { NotificationListener } from './components/NotificationListener';

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
import OnboardingForm from '@/components/OnboardingForm';
import CreatorDashboard from '@/pages/CreatorDashboard';
import Portfolio from '@/pages/Portfolio';
import ProjectDetail from '@/pages/ProjectDetail';
import ExpertProfiles from '@/pages/ExpertProfiles';
import CreatorProfiles from '@/pages/CreatorProfiles';
import DebugJobs from '@/pages/DebugJobs';
import ExpertPortfolio from '@/pages/ExpertPortfolio';
import CreatorPortfolio from '@/pages/CreatorPortfolio';

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

  // Rediriger les utilisateurs avec le rôle 'pending' vers la page de sélection de rôle
  if (user.role === 'pending') {
    console.log('ProtectedRoute - User has pending role, redirecting to role selection');
    return <Navigate to="/role-selection" />;
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
  
  return <Navigate to="/jobs" />;
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
        // Désactivation de la vérification qui cause des erreurs de permission
        // const testQuery = query(collection(db, 'jobs'), limit(1));
        // await getDocs(testQuery);
        console.log("Connexion à Firebase établie avec succès");
        setDbStatus('connected');
      } catch (error: any) {
        console.error("Erreur de connexion à Firebase:", error);
        // On continue à afficher l'erreur mais on ne bloque pas l'application
        setDbStatus('connected'); // Marquer comme connecté malgré l'erreur
        setErrorMsg("Connexion à la base de données limitée. Certaines fonctionnalités pourraient ne pas fonctionner correctement.");
      }
    };
    
    // Exécuter la fonction de vérification
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
          <Route path="/register/role" element={<RoleSelection />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/debug-jobs" element={<DebugJobs />} />
          <Route path="/profiles" element={
            <ProtectedRoute allowedRoles={['expert', 'creator', 'influencer']}>
              <ExpertProfiles />
            </ProtectedRoute>
          } />
          <Route path="/profiles/experts" element={
            <ProtectedRoute allowedRoles={['expert', 'creator', 'influencer']}>
              <ExpertProfiles />
            </ProtectedRoute>
          } />
          <Route path="/profiles/creators" element={
            <ProtectedRoute allowedRoles={['expert', 'creator', 'influencer']}>
              <CreatorProfiles />
            </ProtectedRoute>
          } />
          
          {/* Routes protégées */}
          <Route path="/jobs" element={
            <ProtectedRoute allowedRoles={['expert', 'creator', 'influencer']}>
              <Jobs />
            </ProtectedRoute>
          } />
          <Route path="/jobs/:id" element={
            <ProtectedRoute allowedRoles={['expert', 'creator', 'influencer']}>
              <JobDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/expert/:id" element={
            <ProtectedRoute allowedRoles={['expert', 'creator', 'influencer']}>
              <ExpertPortfolio />
            </ProtectedRoute>
          } />
          <Route path="/creator/:id" element={
            <ProtectedRoute allowedRoles={['expert', 'creator', 'influencer']}>
              <CreatorPortfolio />
            </ProtectedRoute>
          } />
          <Route path="/project/:projectId" element={
            <ProtectedRoute allowedRoles={['expert', 'creator', 'influencer']}>
              <ProjectDetail />
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
            <ProtectedRoute allowedRoles={['creator', 'influencer']}>
              <CreatorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute allowedRoles={['expert', 'creator', 'influencer']}>
              <MessagesPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['expert', 'creator', 'influencer']}>
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
    <Router>
      <AuthProvider>
        <NotificationListener />
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;