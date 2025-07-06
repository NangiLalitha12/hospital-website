
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAppointments, updateAppointmentStatus } from '@/services/firebase';
import { Appointment } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Phone, Mail, Calendar, Clock, User } from 'lucide-react';

const AppointmentsManager = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await getAppointments();
      setAppointments(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId: string, status: Appointment['status']) => {
    try {
      await updateAppointmentStatus(appointmentId, status);
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status } : apt
        )
      );
      toast({
        title: "Success",
        description: "Appointment status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderAppointment = (appointment: Appointment) => (
    <Card key={appointment.id} className="mb-4">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              {appointment.patientName}
            </h3>
            <p className="text-sm text-gray-600">Dr. {appointment.doctorName}</p>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            {format(new Date(appointment.date), 'PPP')}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            {appointment.time}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            {appointment.patientPhone}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4" />
            {appointment.patientEmail}
          </div>
        </div>

        {appointment.reason && (
          <div className="bg-gray-50 p-3 rounded mb-4">
            <p className="text-sm">
              <strong>Reason:</strong> {appointment.reason}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {appointment.status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(appointment.id!, 'confirmed')}
              >
                Confirm
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleStatusUpdate(appointment.id!, 'cancelled')}
              >
                Cancel
              </Button>
            </>
          )}
          {appointment.status === 'confirmed' && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate(appointment.id!, 'completed')}
            >
              Mark Complete
            </Button>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Booked on: {format(appointment.createdAt, 'PPP p')}
        </div>
      </CardContent>
    </Card>
  );

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');
  const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled');
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Appointments Management</h2>
        {pendingAppointments.length > 0 && (
          <Badge variant="destructive" className="text-lg px-3 py-1">
            {pendingAppointments.length} New
          </Badge>
        )}
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({pendingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmed ({confirmedAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelledAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No pending appointments</p>
              </CardContent>
            </Card>
          ) : (
            pendingAppointments.map(renderAppointment)
          )}
        </TabsContent>

        <TabsContent value="confirmed">
          {confirmedAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No confirmed appointments</p>
              </CardContent>
            </Card>
          ) : (
            confirmedAppointments.map(renderAppointment)
          )}
        </TabsContent>

        <TabsContent value="cancelled">
          {cancelledAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No cancelled appointments</p>
              </CardContent>
            </Card>
          ) : (
            cancelledAppointments.map(renderAppointment)
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No completed appointments</p>
              </CardContent>
            </Card>
          ) : (
            completedAppointments.map(renderAppointment)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppointmentsManager;
