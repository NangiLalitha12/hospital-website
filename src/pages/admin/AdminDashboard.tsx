
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getAppointments, getMessages } from '@/services/firebase';
import { Appointment, ContactMessage } from '@/types';
import { Bell, MessageSquare } from 'lucide-react';

// Import all admin components
import HomeEditor from '@/components/admin/HomeEditor';
import ServicesManager from '@/components/admin/ServicesManager';
import DoctorsManager from '@/components/admin/DoctorsManager';
import AppointmentsManager from '@/components/admin/AppointmentsManager';
import BillingManager from '@/components/admin/BillingManager';
import HealthRecordsManager from '@/components/admin/HealthRecordsManager';
import HistoryManager from '@/components/admin/HistoryManager';
import MessagesManager from '@/components/admin/MessagesManager';

const AdminDashboard = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [unseenMessageCount, setUnseenMessageCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch pending appointments
        const appointments = await getAppointments();
        const pending = appointments.filter(apt => apt.status === 'pending');
        setPendingCount(pending.length);

        // Fetch unseen messages count
        const messages = await getMessages();
        const unseenMessages = messages.filter((msg: ContactMessage) => !msg.seen);
        setUnseenMessageCount(unseenMessages.length);
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
    
    // Refresh every 30 seconds to check for new appointments and messages
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <div className="flex gap-3">
              {pendingCount > 0 && (
                <div className="flex items-center gap-2 bg-red-100 px-3 py-2 rounded-full">
                  <Bell className="h-5 w-5 text-red-600" />
                  <Badge variant="destructive" className="text-sm px-2 py-1">
                    {pendingCount} New Appointments
                  </Badge>
                </div>
              )}
              {unseenMessageCount > 0 && (
                <div className="flex items-center gap-2 bg-orange-100 px-3 py-2 rounded-full">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                  <Badge className="bg-orange-600 text-white text-sm px-2 py-1">
                    {unseenMessageCount} Unseen Messages
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <p className="text-xl text-gray-600">Manage your healthcare system with ease</p>
        </div>

        <Tabs defaultValue="appointments" className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-2">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-gray-50 rounded-xl">
              <TabsTrigger value="home" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
                Home
              </TabsTrigger>
              <TabsTrigger value="services" className="data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg">
                Services
              </TabsTrigger>
              <TabsTrigger value="doctors" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg">
                Doctors
              </TabsTrigger>
              <TabsTrigger value="appointments" className="relative data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg">
                Appointments
                {pendingCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="billing" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white rounded-lg">
                Billing
              </TabsTrigger>
              <TabsTrigger value="records" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white rounded-lg">
                Health Records
              </TabsTrigger>
              <TabsTrigger value="messages" className="relative data-[state=active]:bg-orange-600 data-[state=active]:text-white rounded-lg">
                Messages
                {unseenMessageCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-orange-600 text-white">
                    {unseenMessageCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white rounded-lg">
                History
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="space-y-6">
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

            <TabsContent value="messages">
              <MessagesManager />
            </TabsContent>

            <TabsContent value="history">
              <HistoryManager />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
