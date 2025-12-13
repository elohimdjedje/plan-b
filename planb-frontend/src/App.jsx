import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect, lazy, Suspense } from 'react';
import LoadingScreen from './components/common/LoadingScreen';
import ErrorBoundary from './components/common/ErrorBoundary';
import SplashScreen from './components/animations/SplashScreen';
import RequireAuth from './components/auth/RequireAuth';
import RequireAdmin from './components/auth/RequireAdmin';
import { initializeSubscription } from './utils/subscription';
// Importer le store pour l'initialiser au démarrage (expose window.useAuthStore)
import './store/authStore';

// Routes principales (chargement immédiat pour performance)
import Home from './pages/Home';
import ListingDetail from './pages/ListingDetail';
import Auth from './pages/Auth';


// Routes secondaires (lazy loading pour optimisation)
const SearchResults = lazy(() => import('./pages/SearchResults'));
const Publish = lazy(() => import('./pages/Publish'));
const Profile = lazy(() => import('./pages/Profile'));
const Favorites = lazy(() => import('./pages/Favorites'));
const FavoritesList = lazy(() => import('./pages/FavoritesList'));
const RegisterWithOTP = lazy(() => import('./pages/RegisterWithOTP'));
const UpgradePlan = lazy(() => import('./pages/UpgradePlan'));
const WavePayment = lazy(() => import('./pages/WavePayment'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentCancel = lazy(() => import('./pages/PaymentCancel'));
const Settings = lazy(() => import('./pages/Settings'));
const AnimationDemo = lazy(() => import('./pages/AnimationDemo'));
const SellerProfile = lazy(() => import('./pages/SellerProfile'));
const MySubscription = lazy(() => import('./pages/MySubscription'));
const EditListing = lazy(() => import('./pages/EditListing'));
const EditListingPayment = lazy(() => import('./pages/EditListingPayment'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Map = lazy(() => import('./pages/Map'));
const Stats = lazy(() => import('./pages/Stats'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const DebugAuth = lazy(() => import('./pages/DebugAuth'));

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Vérifier l'expiration de l'abonnement au chargement
  useEffect(() => {
    initializeSubscription();

    // Synchroniser le token au démarrage
    if (window.useAuthStore) {
      const store = window.useAuthStore.getState();
      if (typeof store.hydrateToken === 'function') {
        store.hydrateToken();
      }
    }
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 107, 53, 0.2)',
            },
          }}
        />

        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Home />} />

            <Route path="/search" element={<SearchResults />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/seller/:userId" element={<SellerProfile />} />
            <Route path="/map" element={<Map />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/login" element={<Auth />} />
            <Route path="/auth/register" element={<Auth />} />
            <Route path="/auth/register-otp" element={<RegisterWithOTP />} />
            <Route path="/animations" element={<AnimationDemo />} />
            <Route path="/debug-auth" element={<DebugAuth />} />

            {/* Routes protégées - nécessitent une connexion */}
            <Route path="/publish" element={<RequireAuth><Publish /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/my-subscription" element={<RequireAuth><MySubscription /></RequireAuth>} />
            <Route path="/edit-listing/:id" element={<RequireAuth><EditListing /></RequireAuth>} />
            <Route path="/payment/edit-listing" element={<RequireAuth><EditListingPayment /></RequireAuth>} />
            <Route path="/favorites" element={<RequireAuth><Favorites /></RequireAuth>} />
            <Route path="/favorites-new" element={<RequireAuth><FavoritesList /></RequireAuth>} />
            <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
            <Route path="/upgrade" element={<RequireAuth><UpgradePlan /></RequireAuth>} />
            <Route path="/payment/wave" element={<RequireAuth><WavePayment /></RequireAuth>} />
            <Route path="/payment/success" element={<RequireAuth><PaymentSuccess /></RequireAuth>} />
            <Route path="/payment/cancel" element={<RequireAuth><PaymentCancel /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
            <Route path="/stats" element={<RequireAuth><Stats /></RequireAuth>} />

            {/* Route Admin - nécessite ROLE_ADMIN (double protection) */}
            <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
