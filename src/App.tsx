import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import frFR from 'antd/locale/fr_FR';
import MainLayout from './components/Layout';
import { useAuthStore } from './hooks/authStore';
import CardsPage from './pages/CardsPage';
import DashboardPage from './pages/Dashboard';
import LoginPage from './pages/Login';
import MerchantDetails from './pages/Merchantdetails';
import MerchantForm from './pages/Merchantform';
import ProfilePage from './pages/Profile';
import PublicCardPage from './pages/PublicCard';
import StatisticsPage from './pages/Statisticspage';
import ProtectedRoute from './routes/Protectedroute';
import MerchantsPage from './pages/Merchantslist';


function App() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <ConfigProvider
      locale={frFR}
      theme={{
        token: {
          colorPrimary: '#667eea',
          borderRadius: 8,
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/card/:qrCode" element={<PublicCardPage />} />

            {/* Routes protégées */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* Merchants */}
              <Route path="merchants" element={<MerchantsPage />} />
              <Route path="merchants/create" element={<MerchantForm />} />
              <Route path="merchants/:id" element={<MerchantDetails />} />
              <Route path="merchants/:id/edit" element={<MerchantForm />} />
              
              {/* Cards */}
              <Route path="cards" element={<CardsPage />} />
              
              {/* Statistics */}
              <Route path="statistics" element={<StatisticsPage />} />
              
              {/* Profile */}
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Route par défaut */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
