import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import Appointments from "./pages/Appointments";
import QRBooking from "./pages/QRBooking";
import NotFound from "./pages/NotFound";
import { mockUsers } from "@/store/mockData";
import { User } from "@/types";

const queryClient = new QueryClient();

const App = () => {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[2]); // Reception user by default

  const handleRoleSwitch = (role: User['role']) => {
    const user = mockUsers.find(u => u.role === role) || mockUsers[0];
    setCurrentUser(user);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/book" element={<QRBooking />} />
            <Route path="/*" element={
              <div className="flex min-h-screen bg-background">
                <Sidebar currentUser={currentUser} />
                <div className="flex-1 flex flex-col">
                  <Header currentUser={currentUser} onRoleSwitch={handleRoleSwitch} />
                  <main className="flex-1 p-6">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/patients" element={<Patients />} />
                      <Route path="/patients/:id" element={<PatientDetail />} />
                      <Route path="/appointments" element={<Appointments />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
