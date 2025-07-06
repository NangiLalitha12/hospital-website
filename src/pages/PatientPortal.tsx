import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Phone, Mail, Stethoscope, Heart, Trash2, Plus } from 'lucide-react';
import { getPatientAppointments, getAppointments, getServices, getDoctors, deleteAppointment } from '@/services/firebase';
import { Appointment, Service, Doctor } from '@/types';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const PatientPortal = () => {
  const [email, setEmail] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [servicesData, doctorsData] = await Promise.all([
        getServices(),
        getDoctors()
      ]);
      setServices(servicesData);
      setDoctors(doctorsData);
    };
    fetchData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    console.log('Searching for appointments with email:', email);
    setLoading(true);
    try {
      const allAppointments = await getAppointments();
      console.log('All appointments in database:', allAppointments);
      console.log('Searching for email matches with:', email);
      
      const matchingAppointments = allAppointments.filter(apt => 
        apt.patientEmail && apt.patientEmail.toLowerCase() === email.toLowerCase()
      );
      console.log('Matching appointments by manual filter:', matchingAppointments);

      const patientAppointments = await getPatientAppointments(email.trim());
      console.log('Patient appointments from query:', patientAppointments);
      
      const finalAppointments = patientAppointments.length > 0 ? patientAppointments : matchingAppointments;
      console.log('Final appointments to display:', finalAppointments);
      
      setAppointments(finalAppointments);
      setSearched(true);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteAppointment(appointmentId);
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to delete appointment. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Patient Portal</h1>
          <p className="text-lg text-gray-600">Access your appointments, explore services, and find doctors</p>
        </div>

        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments">My Appointments</TabsTrigger>
            <TabsTrigger value="services">Explore Services</TabsTrigger>
            <TabsTrigger value="doctors">Our Doctors</TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            {/* Email Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Access Your Appointments
                  <Button asChild size="sm" className="gap-2">
                    <Link to="/appointment">
                      <Plus className="h-4 w-4" />
                      Book New Appointment
                    </Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="email">Enter your email address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="mt-6">
                    {loading ? 'Searching...' : 'View Appointments'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Appointments List */}
            {searched && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-2">No Appointments Found</p>
                      <p className="text-sm text-gray-400">
                        It looks like there are no appointments linked to this email address.
                        Please make sure you entered the exact same email address you used while booking.
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Email searched: {email}
                      </p>
                      <Button asChild className="mt-4">
                        <Link to="/appointment">Book Your First Appointment</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {appointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Dr. {appointment.doctorName}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {format(new Date(appointment.date), 'PPP')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {appointment.time}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(appointment.status)}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </Badge>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteAppointment(appointment.id!)}
                                title="Delete appointment"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="h-4 w-4" />
                              {appointment.patientName}
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
                                <strong>Reason for visit:</strong> {appointment.reason}
                              </p>
                            </div>
                          )}

                          {/* Billing Information */}
                          {appointment.consultationFee && appointment.consultationFee > 0 && (
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
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
                              {appointment.feeStatus === 'pending' && (
                                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                  <p className="text-sm text-yellow-800">
                                    💰 <strong>Payment Required:</strong> Your consultation fee of ${appointment.consultationFee} – Please pay at the OP desk when you visit the hospital.
                                  </p>
                                </div>
                              )}
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
            )}
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Healthcare Services</h2>
              <p className="text-lg text-gray-600">Comprehensive medical care for all your health needs</p>
            </div>

            {services.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Services Coming Soon</h3>
                  <p className="text-gray-500">Our comprehensive service catalog will be available shortly</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Card key={service.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                    {service.image && (
                      <div 
                        className="h-48 bg-cover bg-center rounded-t-lg" 
                        style={{ backgroundImage: `url(${service.image})` }} 
                      />
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {service.icon && (
                          <img src={service.icon} alt="" className="w-6 h-6" />
                        )}
                        {service.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      <Button asChild className="w-full">
                        <Link to="/appointment">Book Appointment</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Doctors Tab */}
          <TabsContent value="doctors" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Expert Doctors</h2>
              <p className="text-lg text-gray-600">Experienced healthcare professionals dedicated to your well-being</p>
            </div>

            {doctors.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Doctor Profiles Coming Soon</h3>
                  <p className="text-gray-500">Our doctor directory will be available shortly</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doctor) => (
                  <Card key={doctor.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                    {doctor.image && (
                      <div 
                        className="h-64 bg-cover bg-center rounded-t-lg" 
                        style={{ backgroundImage: `url(${doctor.image})` }} 
                      />
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl">{doctor.name}</CardTitle>
                      <Badge variant="secondary" className="w-fit">
                        {doctor.specialty}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600">{doctor.bio}</p>
                      
                      {doctor.qualifications && doctor.qualifications.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Qualifications:</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {doctor.qualifications.map((qual, index) => (
                              <li key={index}>{qual}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {doctor.availability && doctor.availability.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Available Days:</h4>
                          <div className="flex flex-wrap gap-1">
                            {doctor.availability.map((day, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {day}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button asChild className="w-full">
                        <Link to={`/appointment?doctor=${doctor.id}`}>
                          Book Appointment
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Links and Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-600">Access additional patient services:</p>
              <ul className="space-y-1 text-sm">
                <li>• Lab Results Portal</li>
                <li>• Prescription Refills</li>
                <li>• Insurance Information</li>
                <li>• Billing and Payments</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-600">Need help? Contact us:</p>
              <ul className="space-y-1 text-sm">
                <li>• Phone: (555) 123-4567</li>
                <li>• Email: support@medicare.com</li>
                <li>• Emergency: 911</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientPortal;
