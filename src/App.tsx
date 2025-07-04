
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Services from "./pages/Services";
import Doctors from "./pages/Doctors";
import AppointmentBooking from "./pages/AppointmentBooking";
import PatientPortal from "./pages/PatientPortal";
import HealthRecords from "./pages/HealthRecords";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <>
                <Navigation />
                <Home />
              </>
            } />
            <Route path="/services" element={
              <>
                <Navigation />
                <Services />
              </>
            } />
            <Route path="/doctors" element={
              <>
                <Navigation />
                <Doctors />
              </>
            } />
            <Route path="/appointment" element={
              <>
                <Navigation />
                <AppointmentBooking />
              </>
            } />
            <Route path="/patient-portal" element={
              <>
                <Navigation />
                <PatientPortal />
              </>
            } />
            <Route path="/health-records" element={
              <>
                <Navigation />
                <HealthRecords />
              </>
            } />
            <Route path="/contact" element={
              <>
                <Navigation />
                <Contact />
              </>
            } />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
