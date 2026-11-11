import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';
import type { Profile } from './lib/types';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SubmissionFormPage from './pages/SubmissionFormPage';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';
import StoryBankPage from './pages/StoryBankPage';
import SettingsPage from './pages/SettingsPage';
import MetricsPage from './pages/MetricsPage';
import ReportsPage from './pages/ReportsPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import NavBar from './components/NavBar';

function App() {
  const { loading, setUser, setLoading, setError } = useAuthStore();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Fetch user profile (optional - may not exist yet)
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          setUser(profile ? (profile as Profile) : { id: session.user.id, email: session.user.email } as Profile);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        setUser(profile ? (profile as Profile) : { id: session.user.id, email: session.user.email } as Profile);
      } else {
        setUser(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, [setUser, setLoading, setError]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>
        {/* No navbar routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/submit" element={<SubmissionFormPage />} />

        {/* Routes with navbar */}
        <Route
          path="*"
          element={
            <>
              <NavBar />
              <Routes>
                <Route path="/board" element={<BoardPage />} />
                <Route path="/bank" element={<StoryBankPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/metrics" element={<MetricsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              </Routes>
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
