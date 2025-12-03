import { useState } from 'react';
import { Sidebar } from './dashboard/sidebar';
import { Dashboard } from './dashboard/dashboard';
import { ProductTable } from './product/product-table';
import { DummyProductTable } from './components/DummyProductTable';
import { UserTable } from './user/user-table';
import { Profile } from './dashboard/profile';
import { LoginForm } from './components/ui/login-form';
import { SignupForm } from './components/ui/signup-form';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {authView === 'login' ? (
          <div>
            <LoginForm />
            <div className="text-center mt-4">
              <button 
                onClick={() => setAuthView('signup')}
                className="text-blue-600 underline"
              >
                Don't have an account? Sign up
              </button>
            </div>
          </div>
        ) : (
          <div>
            <SignupForm />
            <div className="text-center mt-4">
              <button 
                onClick={() => setAuthView('login')}
                className="text-blue-600 underline"
              >
                Already have an account? Login
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }



  const renderContent = () => {
    switch (currentView) {
      case 'users':
        return <UserTable />;
      case 'products':
        return <ProductTable />;
      case 'dummy-products':
        return <DummyProductTable />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex">
      <Sidebar onNavigate={setCurrentView} />
      <main className="ml-64 flex-1 p-6">
        {renderContent()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;