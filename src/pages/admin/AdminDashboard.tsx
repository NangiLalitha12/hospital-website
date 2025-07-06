
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getAppointments } from '@/services/firebase';
import { Appointment } from '@/types';
import { Bell } from 'lucide-react';

// Import all admin components
import HomeEditor from '@/components/admin/HomeEditor';
import ServicesManager from '@/components/admin/ServicesManager';
import DoctorsManager from '@/components/admin/DoctorsManager';
import AppointmentsManager from '@/components/admin/AppointmentsManager';
import BillingManager from '@/components/admin/BillingManager';
import HealthRecordsManager from '@/components/admin/HealthRecordsManager';
import HistoryManager from '@/components/admin/HistoryManager';

const AdminDashboard = () => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPendingAppointments = async () => {
      try {
        const appointments = await getAppointments();
        const pending = appointments.filter(apt => apt.status === 'pending');
        setPendingCount(pending.length);
      } catch (error) {
        console.error('Error fetching pending appointments:', error);
      }
    };

    fetchPendingAppointments();
    
    // Refresh every 30 seconds to check for new appointments
    const interval = setInterval(fetchPendingAppointments, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            {pendingCount > 0 && (
              <div className="flex items-center gap-2">
                <Bell className="h-6 w-6 text-red-500" />
                <Badge variant="destructive" className="text-lg px-3 py-1">
                  {pendingCount} New Appointments
                </Badge>
              </div>
            )}
          </div>
          <p className="text-lg text-gray-600">Manage your hospital system</p>
        </div>

        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="appointments" className="relative">
              Appointments
              {pendingCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="records">Health Records</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="home">
            <HomeEditor />
          </TabsContent>

          <TabsContent value="services">
            <ServicesManager />
          </TabsContent>

          <TabsContent value="doctors">
            <DoctorsManager />
          </TabsContent>

          <TabsContent value="appointments">
            <AppointmentsManager />
          </TabsContent>

          <TabsContent value="billing">
            <BillingManager />
          </TabsContent>

          <TabsContent value="records">
            <HealthRecordsManager />
          </TabsContent>

          <TabsContent value="history">
            <HistoryManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
