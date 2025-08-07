import React, { useContext, useEffect, lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';

// Context Providers (keep these as they wrap the whole app)
import { CartProvider, CartContext } from './context/CartContext';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { LocationProvider, LocationContext } from './context/LocationContext';
import { ProductProvider } from './context/ProductContext';

// Eagerly-loaded components (small/critical)
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/Login/LoginPage';
import Profilepage from './pages/Profile/Profilepage';
import AddressSelector from './components/AddressSelector/AddressSelector';
import PageSkeleton from './pages/Skeleton/PageSkeleton';
import PincodeNotServiceable from './pages/PincodeNotServiceable/PincodeNotServiceable';
import ContactUsPage from './pages/details/ContactUsPage';
import TermsAndConditionsPage from './pages/details/TermsAndConditionsPage';
import RefundPolicyPage from './pages/details/RefundPolicyPage';
import PrivacyPolicy from './pages/details/PrivacyPolicyPage';
import MyOrdersPage from './pages/Orders/MyOrdersPage';
import TrackOrderPage from './pages/Orders/TrackOrderPage';

// Lazy-loaded (larger) components
const MapPage = lazy(() => import('./components/Map/MapPage'));
const ProductDetail = lazy(() => import('./pages/ProductDetail/ProductDetail'));
const CartPage = lazy(() => import('./pages/CartPage/CartPage'));
const SearchPage = lazy(() => import('./pages/SearchPage/SearchPage'));
const ProductPage = lazy(() => import('./pages/ProductPage/ProductPage'));
const PaymentStatus = lazy(() => import('./components/Payment/PaymentStatus'));
const OrdersHistory = lazy(() => import('./pages/Orders/OrdersHistory'));
const Rewards = lazy(() => import('./components/Rewards/Rewards'));

// AppRoutes component handles all routing logic based on auth status
const AppRoutes = () => {
  const { user, loading: authLoading, isGuest } = useContext(AuthContext);
  const navigate = useNavigate();
  const currentRouteLocation = useLocation();

  // Redirect from /login to /home if user logs in while on login page
  useEffect(() => {
    if (!authLoading && user && currentRouteLocation.pathname === '/login') {
      console.log("User authenticated, redirecting from /login to /home.");
      navigate('/home', { replace: true });
    }
  }, [authLoading, user, navigate, currentRouteLocation.pathname]);

  // Show a loading skeleton while authentication status is being determined
  if (authLoading) {
    return <PageSkeleton />;
  }

  return (
    <Routes>
      {/* Routes accessible to ALL (Guests & Authenticated) */}
      <Route path="/" element={<Navigate to="/home" replace />} /> {/* Default redirect */}
      <Route path="/home" element={<HomePage />} />
      <Route path="/productdetail/:productId" element={<Suspense fallback={<PageSkeleton />}><ProductDetail /></Suspense>} />
      <Route path="/searchpage" element={<Suspense fallback={<PageSkeleton />}><SearchPage /></Suspense>} />
      <Route path="/productpage" element={<Suspense fallback={<PageSkeleton />}><ProductPage /></Suspense>} />
      <Route path="/cartpage" element={<Suspense fallback={<PageSkeleton />}><CartPage /></Suspense>} />
      <Route path="/contactus" element={<ContactUsPage />} />
      <Route path="/privacypolicy" element={<PrivacyPolicy />} />
      <Route path="/termsandcondtions" element={<TermsAndConditionsPage />} />
      <Route path="/refundpolicy" element={<RefundPolicyPage />} />
      <Route path="/PincodeNotServiceable" element={<PincodeNotServiceable />} />

      {/* Conditional Routes based on Authentication Status */}
      {isGuest ? (
        <>
          {/* Guest-only access */}
          <Route path="/login" element={<LoginPage />} />

          {/* Restricted routes for guests: redirect to login */}
          <Route path="/profile" element={<Navigate to="/login" replace />} />
          <Route path="/mappage" element={<Navigate to="/login" replace />} />

          {/* Guests ARE allowed to access these pages (as per new requirement) */}
          <Route path="/address" element={<AddressSelector />} />
          <Route path="/payment-status" element={<Suspense fallback={<PageSkeleton />}><PaymentStatus /></Suspense>} />
          <Route path="/ordershistory" element={<Suspense fallback={<PageSkeleton />}><OrdersHistory /></Suspense>} />
          <Route path="/rewards" element={<Suspense fallback={<PageSkeleton />}><Rewards /></Suspense>} />

          {/* Catch-all for any other route not explicitly allowed or redirected */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </>
      ) : (
        <>
          {/* Authenticated user only access */}
          <Route path="/login" element={<Navigate to="/home" replace />} /> {/* Auth users cannot access login */}

          {/* All other routes are accessible for authenticated users */}
          <Route path="/profile" element={<Profilepage />} />
          <Route path="/address" element={<AddressSelector />} />
          <Route path="/mappage" element={<Suspense fallback={<PageSkeleton />}><MapPage /></Suspense>} />
          <Route path="/payment-status" element={<Suspense fallback={<PageSkeleton />}><PaymentStatus /></Suspense>} />
          <Route path="/ordershistory" element={<Suspense fallback={<PageSkeleton />}><OrdersHistory /></Suspense>} />
          <Route path="/orders" element={<MyOrdersPage />} />
<Route path="/orders/:id" element={<TrackOrderPage />} />

          <Route path="/rewards" element={<Suspense fallback={<PageSkeleton />}><Rewards /></Suspense>} />

          {/* Catch-all for authenticated users */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </>
      )}
    </Routes>
  );
};

// Main App component wrapping all providers and routes
const App = () => {
  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <ProductProvider>
            <Router>
              <AppRoutes />
            </Router>
          </ProductProvider>
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
};

export default App;
