
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getAppointments, updateAppointmentFee } from '@/services/firebase';
import { Appointment } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { DollarSign, User, Calendar } from 'lucide-react';

const BillingManager = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<string>('');
  const [fee, setFee] = useState('');
  const [feeStatus, setFeeStatus] = useState<'pending' | 'paid' | 'waived'>('pending');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await getAppointments();
      // Only show confirmed and completed appointments for billing
      const billableAppointments = data.filter(apt => 
        apt.status === 'confirmed' || apt.status === 'completed'
      );
      setAppointments(billableAppointments);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive",
      });
    }
  };

  const handleFeeUpdate = async () => {
    if (!selectedAppointment || !fee) {
      toast({
        title: "Error",
        description: "Please select an appointment and enter fee amount",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateAppointmentFee(selectedAppointment, parseFloat(fee), feeStatus, notes);
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === selectedAppointment ? {
            ...apt,
            consultationFee: parseFloat(fee),
            feeStatus,
            feeNotes: notes
          } : apt
        )
      );
      toast({
        title: "Success",
        description: "Billing information updated successfully",
      });
      // Reset form
      setSelectedAppointment('');
      setFee('');
      setFeeStatus('pending');
      setNotes('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update billing information",
        variant: "destructive",
      });
    }
  };

  const getFeeStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'waived': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalRevenue = appointments
    .filter(apt => apt.feeStatus === 'paid' && apt.consultationFee)
    .reduce((sum, apt) => sum + (apt.consultationFee || 0), 0);

  const pendingAmount = appointments
    .filter(apt => apt.feeStatus === 'pending' && apt.consultationFee)
    .reduce((sum, apt) => sum + (apt.consultationFee || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Billing Management</h2>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-yellow-600 mr-4" />
            <div>
              <p className="text-2xl font-bold text-yellow-600">${pendingAmount.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Pending Payments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <User className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{appointments.length}</p>
              <p className="text-sm text-gray-600">Total Appointments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Update Form */}
      <Card>
        <CardHeader>
          <CardTitle>Update Consultation Fee</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="appointment">Select Appointment</Label>
            <select
              id="appointment"
              className="w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              value={selectedAppointment}
              onChange={(e) => setSelectedAppointment(e.target.value)}
            >
              <option value="">Select an appointment</option>
              {appointments.map((appointment) => (
                <option key={appointment.id} value={appointment.id}>
                  {appointment.patientName} - Dr. {appointment.doctorName} - {format(new Date(appointment.date), 'PPP')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="fee">Consultation Fee ($)</Label>
            <Input
              id="fee"
              type="number"
              step="0.01"
              placeholder="Enter fee amount"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="feeStatus">Payment Status</Label>
            <select
              id="feeStatus"
              className="w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              value={feeStatus}
              onChange={(e) => setFeeStatus(e.target.value as 'pending' | 'paid' | 'waived')}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="waived">Waived</option>
            </select>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Enter any notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button onClick={handleFeeUpdate}>Update Billing Information</Button>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{appointment.patientName}</h3>
                  <p className="text-sm text-gray-600">Dr. {appointment.doctorName}</p>
                  <p className="text-sm text-gray-600">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    {format(new Date(appointment.date), 'PPP')}
                  </p>
                </div>
                <div className="text-right">
                  {appointment.consultationFee ? (
                    <>
                      <p className="font-semibold">${appointment.consultationFee}</p>
                      <Badge className={getFeeStatusColor(appointment.feeStatus || 'pending')}>
                        {appointment.feeStatus || 'Not Set'}
                      </Badge>
                      {appointment.feeNotes && (
                        <p className="text-xs text-gray-500 mt-1">{appointment.feeNotes}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Fee not set</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingManager;
