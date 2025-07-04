import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getDoctors, addAppointment, addUser, getUserByEmail } from '@/services/firebase';
import { Doctor } from '@/types';
import { toast } from '@/hooks/use-toast';

const AppointmentBooking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>(searchParams.get('doctor') || '');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'signup' | 'appointment'>('signup');
  
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [appointmentData, setAppointmentData] = useState({
    reason: '',
  });

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      const doctorsData = await getDoctors();
      setDoctors(doctorsData);
    };
    fetchDoctors();
  }, []);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupData.name || !signupData.email || !signupData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check if user already exists
      const existingUser = await getUserByEmail(signupData.email);
      
      if (!existingUser) {
        // Create new user with createdAt field
        await addUser({
          ...signupData,
          createdAt: new Date()
        });
        toast({
          title: "Account Created",
          description: "Your account has been created successfully.",
        });
      } else {
        toast({
          title: "Welcome Back",
          description: "We found your existing account.",
        });
      }

      setStep('appointment');
    } catch (error) {
      console.error('Error during signup:', error);
      toast({
        title: "Signup Failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const doctor = doctors.find(d => d.id === selectedDoctor);
    if (!doctor) return;

    setLoading(true);

    try {
      await addAppointment({
        patientName: signupData.name,
        patientEmail: signupData.email,
        patientPhone: signupData.phone,
        doctorId: selectedDoctor,
        doctorName: doctor.name,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        reason: appointmentData.reason,
        status: 'pending',
        createdAt: new Date(),
      });

      toast({
        title: "Appointment Booked!",
        description: "Your appointment has been successfully booked. We'll confirm it soon.",
      });

      // Redirect to patient portal
      setTimeout(() => {
        navigate('/patient-portal');
      }, 2000);
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error booking your appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {step === 'signup' ? 'Create Account & Book Appointment' : 'Book Your Appointment'}
            </CardTitle>
            <div className="flex justify-center mt-4">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'signup' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                }`}>
                  1
                </div>
                <div className="w-12 h-px bg-gray-300"></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'appointment' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {step === 'signup' ? (
              <form onSubmit={handleSignupSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Your Information</h3>
                  
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={signupData.name}
                      onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={signupData.phone}
                      onChange={(e) => setSignupData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Continue to Appointment'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleAppointmentSubmit} className="space-y-6">
                {/* Doctor Selection */}
                <div>
                  <Label>Select Doctor *</Label>
                  <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id!}>
                          Dr. {doctor.name} - {doctor.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Selection */}
                <div>
                  <Label>Preferred Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date() || date.getDay() === 0}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Selection */}
                <div>
                  <Label>Preferred Time *</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reason for Visit */}
                <div>
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please describe your symptoms or reason for the visit..."
                    value={appointmentData.reason}
                    onChange={(e) => setAppointmentData(prev => ({ ...prev, reason: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep('signup')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Booking...' : 'Book Appointment'}
                  </Button>
                </div>
              </form>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Important Notes:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Appointments are subject to doctor availability</li>
                <li>• Please arrive 15 minutes early for your appointment</li>
                <li>• Bring a valid ID and insurance card</li>
                <li>• You will receive a confirmation email once approved</li>
                <li>• You can check your appointment status in the Patient Portal</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentBooking;
