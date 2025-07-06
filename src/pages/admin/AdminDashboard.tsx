import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Phone, Mail, DollarSign, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  getAppointments,
  updateAppointmentStatus,
  updateAppointmentFee,
  deleteAppointment
} from '@/services/firebase';
import { Appointment } from '@/types';
import { toast } from '@/components/ui/use-toast';

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [status, setStatus] = useState<Appointment['status']>('pending');
  const [appointmentId, setAppointmentId] = useState('');
  const [fee, setFee] = useState('');
  const [feeStatus, setFeeStatus] = useState<'pending' | 'paid' | 'waived' | ''>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const appointmentsData = await getAppointments();
        setAppointments(appointmentsData);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: "Error",
          description: "Failed to fetch appointments",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const pendingAppointments = appointments.filter(appointment => appointment.status === 'pending');
  const confirmedAppointments = appointments.filter(appointment => appointment.status === 'confirmed');
  const cancelledAppointments = appointments.filter(appointment => appointment.status === 'cancelled');
  const completedAppointments = appointments.filter(appointment => appointment.status === 'completed');

  const handleStatusUpdate = async () => {
    if (!appointmentId || !status) {
      alert('Please select an appointment and a status.');
      return;
    }

    try {
      await updateAppointmentStatus(appointmentId, status);
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: status } : apt
        )
      );
      toast({
        title: "Success",
        description: "Appointment status updated successfully",
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  const handleFeeUpdate = async () => {
    if (!appointmentId || !fee || !feeStatus) {
      alert('Please select an appointment and enter fee details.');
      return;
    }

    try {
      await updateAppointmentFee(appointmentId, parseFloat(fee), feeStatus, notes);
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { 
            ...apt, 
            consultationFee: parseFloat(fee), 
            feeStatus: feeStatus as 'pending' | 'paid' | 'waived', 
            feeNotes: notes 
          } : apt
        )
      );
      toast({
        title: "Success",
        description: "Appointment fee updated successfully",
      });
    } catch (error) {
      console.error('Error updating appointment fee:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment fee",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteAppointment(appointmentId);
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
          <p className="text-lg text-gray-600">Manage appointments and system settings</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Pending Appointments Tab */}
          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Appointments</CardTitle>
                <CardDescription>Approve or reject new appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No pending appointments</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="border rounded-lg p-6 bg-yellow-50"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{appointment.patientName}</h3>
                            <p className="text-sm text-gray-600">Dr. {appointment.doctorName}</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(appointment.date), 'PPP')} at {appointment.time}
                            </p>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Pending
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setAppointmentId(appointment.id!);
                              setStatus('confirmed');
                              handleStatusUpdate();
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setAppointmentId(appointment.id!);
                              setStatus('cancelled');
                              handleStatusUpdate();
                            }}
                          >
                            Reject
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteAppointment(appointment.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="mt-4 text-xs text-gray-500">
                          Booked on: {format(appointment.createdAt, 'PPP p')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Confirmed Appointments Tab */}
          <TabsContent value="confirmed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Confirmed Appointments</CardTitle>
                <CardDescription>Manage upcoming appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {confirmedAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No confirmed appointments</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {confirmedAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="border rounded-lg p-6 bg-green-50"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{appointment.patientName}</h3>
                            <p className="text-sm text-gray-600">Dr. {appointment.doctorName}</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(appointment.date), 'PPP')} at {appointment.time}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800">
                              Confirmed
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => {
                                setAppointmentId(appointment.id!);
                                setStatus('completed');
                                handleStatusUpdate();
                              }}
                            >
                              Mark Complete
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteAppointment(appointment.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                        <div className="mt-4 text-xs text-gray-500">
                          Booked on: {format(appointment.createdAt, 'PPP p')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Update Appointment Fee</CardTitle>
                <CardDescription>Set or modify consultation fees</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <Label htmlFor="appointmentId">Select Appointment</Label>
                  <Input
                    id="appointmentId"
                    type="text"
                    placeholder="Enter Appointment ID"
                    value={appointmentId}
                    onChange={(e) => setAppointmentId(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="fee">Consultation Fee</Label>
                  <Input
                    id="fee"
                    type="number"
                    placeholder="Enter Fee Amount"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="feeStatus">Fee Status</Label>
                  <select
                    id="feeStatus"
                    className="w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    value={feeStatus}
                    onChange={(e) => setFeeStatus(e.target.value as 'pending' | 'paid' | 'waived' | '')}
                  >
                    <option value="">Select Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="waived">Waived</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    type="text"
                    placeholder="Enter Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <Button onClick={handleFeeUpdate}>Update Fee</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cancelled Appointments Tab */}
          <TabsContent value="cancelled" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cancelled Appointments</CardTitle>
                <CardDescription>View cancelled appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {cancelledAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No cancelled appointments</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cancelledAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="border rounded-lg p-6 bg-red-50"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{appointment.patientName}</h3>
                            <p className="text-sm text-gray-600">Dr. {appointment.doctorName}</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(appointment.date), 'PPP')} at {appointment.time}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-red-100 text-red-800">
                              Cancelled
                            </Badge>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteAppointment(appointment.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                        <div className="mt-4 text-xs text-gray-500">
                          Booked on: {format(appointment.createdAt, 'PPP p')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Section */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appointment History</CardTitle>
                <CardDescription>Completed appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {completedAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No completed appointments yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="border rounded-lg p-6 bg-green-50"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{appointment.patientName}</h3>
                            <p className="text-sm text-gray-600">Dr. {appointment.doctorName}</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(appointment.date), 'PPP')} at {appointment.time}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800">
                              Completed
                            </Badge>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteAppointment(appointment.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                        {appointment.consultationFee && appointment.consultationFee > 0 && (
                          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">Billing Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <p><strong>Consultation Fee:</strong> ${appointment.consultationFee}</p>
                              <p><strong>Payment Status:</strong> 
                                <Badge className={`ml-2 ${
                                  appointment.feeStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                                  appointment.feeStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  appointment.feeStatus === 'waived' ? 'bg-blue-100 text-blue-800' : 
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {appointment.feeStatus ? 
                                    appointment.feeStatus.charAt(0).toUpperCase() + appointment.feeStatus.slice(1) : 
                                    'Not Set'
                                  }
                                </Badge>
                              </p>
                            </div>
                            {appointment.feeNotes && (
                              <p className="text-sm text-blue-700 mt-2">
                                <strong>Note:</strong> {appointment.feeNotes}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="mt-4 text-xs text-gray-500">
                          Completed on: {format(appointment.createdAt, 'PPP p')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
