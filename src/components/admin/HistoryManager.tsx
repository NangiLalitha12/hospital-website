
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAppointments } from '@/services/firebase';
import { Appointment } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Calendar, Clock, User, Phone, Mail, DollarSign } from 'lucide-react';

const HistoryManager = () => {
  const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCompletedAppointments();
  }, []);

  const fetchCompletedAppointments = async () => {
    setLoading(true);
    try {
      const data = await getAppointments();
      const completed = data.filter(apt => apt.status === 'completed');
      setCompletedAppointments(completed);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch appointment history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalCompletedAppointments = completedAppointments.length;
  const totalRevenue = completedAppointments
    .filter(apt => apt.feeStatus === 'paid' && apt.consultationFee)
    .reduce((sum, apt) => sum + (apt.consultationFee || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Appointment History</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <User className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{totalCompletedAppointments}</p>
              <p className="text-sm text-gray-600">Completed Appointments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Revenue from Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completed Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Appointments History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading history...</p>
            </div>
          ) : completedAppointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No completed appointments yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedAppointments.map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-6 bg-green-50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {appointment.patientName}
                      </h3>
                      <p className="text-sm text-gray-600">Dr. {appointment.doctorName}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Completed
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

                  {appointment.consultationFee && appointment.consultationFee > 0 && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Billing Information
                      </h4>
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

                  <div className="text-xs text-gray-500">
                    Completed on: {format(appointment.createdAt, 'PPP p')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryManager;
