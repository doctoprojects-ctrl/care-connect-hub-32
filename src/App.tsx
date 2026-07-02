import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PINLogin } from "@/components/auth/PINLogin";
import { useSupabaseBootstrap } from "@/lib/supabaseSync";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import Appointments from "./pages/Appointments";
import Users from "./pages/Users";
import QRBooking from "./pages/QRBooking";
import QRGenerator from "./pages/QRGenerator";
import Pharmacy from "./pages/Pharmacy";
import EquipmentPage from "./pages/Equipment";
import CalendarView from "./pages/CalendarView";
import CashUp from "./pages/CashUp";
import Reports from "./pages/Reports";
import Invoices from "./pages/Invoices";
import ServicePrices from "./pages/ServicePrices";
import PatientCredits from "./pages/PatientCredits";
import Statements from "./pages/Statements";
import Manual from "./pages/Manual";
import Doctors from "./pages/Doctors";
import Queue from "./pages/Queue";
import QueueDisplay from "./pages/QueueDisplay";
import Ads from "./pages/Ads";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated, user } = useAuth();
  useSupabaseBootstrap();

  if (!isAuthenticated) {
    return <PINLogin />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentUser={user!} />
      <div className="flex-1 flex flex-col">
        <Header currentUser={user!} />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/calendar" element={<CalendarView />} />
            {(user?.role === 'admin' || user?.role === 'cashier' || user?.role === 'supervisor') && (
              <Route path="/pharmacy" element={<Pharmacy />} />
            )}
            {(user?.role === 'admin' || user?.role === 'cashier') && (
              <Route path="/cashup" element={<CashUp />} />
            )}
            {(user?.role === 'admin' || user?.role === 'supervisor') && (
              <Route path="/reports" element={<Reports />} />
            )}
            {(user?.role === 'admin' || user?.role === 'reception' || user?.role === 'cashier') && (
              <Route path="/invoices" element={<Invoices />} />
            )}
            {(user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'reception') && (
              <Route path="/credits" element={<PatientCredits />} />
            )}
            {(user?.role === 'admin' || user?.role === 'reception' || user?.role === 'supervisor' || user?.role === 'doctor') && (
              <Route path="/statements" element={<Statements />} />
            )}
            <Route path="/services" element={<ServicePrices />} />
            <Route path="/manual" element={<Manual />} />
            {(user?.role === 'admin' || user?.role === 'reception') && (
              <Route path="/doctors" element={<Doctors />} />
            )}
            {(user?.role === 'admin' || user?.role === 'doctor') && (
              <Route path="/equipment" element={<EquipmentPage />} />
            )}
            {user?.role === 'admin' && (
              <Route path="/users" element={<Users />} />
            )}
            {(user?.role === 'admin' || user?.role === 'reception') && (
              <Route path="/qr-generator" element={<QRGenerator />} />
            )}
            {(user?.role === 'admin' || user?.role === 'reception' || user?.role === 'doctor' || user?.role === 'cashier' || user?.role === 'supervisor') && (
              <Route path="/queue" element={<Queue />} />
            )}
            {(user?.role === 'admin' || user?.role === 'marketing') && (
              <Route path="/ads" element={<Ads />} />
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/book" element={<QRBooking />} />
                <Route path="/queue/display" element={<QueueDisplay />} />
                <Route path="/*" element={<AppContent />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
