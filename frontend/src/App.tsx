import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { FarmsPage } from './pages/FarmsPage';
import { SoilReportPage } from './pages/SoilReportPage';
import { RecommendationPage } from './pages/RecommendationPage';
import { StorePage } from './pages/StorePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { SchemesPage } from './pages/SchemesPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { QuickRecommendationPage } from './pages/QuickRecommendationPage';
import { DiseaseDetectionPage } from './pages/DiseaseDetectionPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ProfilePage } from './pages/ProfilePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const Layout = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C2825] font-sans antialiased selection:bg-[#2E6F40] selection:text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6">
        <Outlet />
      </main>
    </div>
  );
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes inside Main Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/farms" element={<FarmsPage />} />
                <Route path="/quick-recommendation" element={<QuickRecommendationPage />} />
                <Route path="/disease-detection" element={<DiseaseDetectionPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/report/:soilId" element={<SoilReportPage />} />
                <Route path="/recommendations/:soilId" element={<RecommendationPage />} />
                <Route path="/store" element={<StorePage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/schemes" element={<SchemesPage />} />
                <Route path="/profile" element={<ProfilePage />} />

                {/* Admin Role Protected Route */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
                  <Route path="/admin-panel" element={<AdminPanelPage />} />
                </Route>
              </Route>
            </Route>

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
