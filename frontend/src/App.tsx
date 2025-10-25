import React, { useState, useEffect } from 'react';
import { Landing } from './components/Landing';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { ProductDetail } from './components/ProductDetail';
import { Profile } from './components/Profile';
import { AdminDashboard } from './components/AdminDashboard';
import { Chat } from './components/Chat';
import { SellItem } from './components/SellItem';
import { Settings } from './components/Settings';
import { Navbar } from './components/Navbar';
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from './contexts/AuthContext';

// App context for navigation and shared state
interface AppContextType {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  selectedProduct: any;
  setSelectedProduct: (product: any) => void;
}

const AppContext = React.createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// Main App component with navigation logic
const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Update current page based on auth state
  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is logged in - default to dashboard if still on landing/auth
        if (currentPage === 'landing' || currentPage === 'auth') {
          setCurrentPage('dashboard');
        }
      } else {
        // User is not logged in - redirect to landing if on protected pages
        const publicPages = ['landing', 'auth'];
        if (!publicPages.includes(currentPage)) {
          setCurrentPage('landing');
        }
      }
    }
  }, [user, loading, currentPage]);

  // Prevent non-admins from opening admin dashboard
  useEffect(() => {
    if (currentPage === 'admin' && !user?.isAdmin) {
      setCurrentPage('settings');
    }
  }, [currentPage, user]);

  const contextValue: AppContextType = {
    currentPage,
    setCurrentPage,
    selectedProduct,
    setSelectedProduct
  };

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Show navbar on all pages except landing and auth */}
        {user && currentPage !== 'landing' && currentPage !== 'auth' && <Navbar />}
        
        {currentPage === 'landing' && <Landing />}
        {currentPage === 'auth' && <Auth />}
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'product' && <ProductDetail />}
        {currentPage === 'profile' && <Profile />}
        {currentPage === 'admin' && user?.isAdmin && <AdminDashboard />}
        {currentPage === 'chat' && <Chat />}
        {currentPage === 'sell' && <SellItem />}
        {currentPage === 'settings' && <Settings />}
        <Toaster />
      </div>
    </AppContext.Provider>
  );
};

// Root App component with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
