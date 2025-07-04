
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getDoctors } from '@/services/firebase';
import { Doctor } from '@/types';

const Doctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      const doctorsData = await getDoctors();
      setDoctors(doctorsData);
      setLoading(false);
    };
    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Doctors</h1>
          <p className="text-lg text-gray-600">Meet our team of experienced healthcare professionals</p>
        </div>

        {doctors.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-600">Coming Soon</h2>
            <p className="text-gray-500 mt-2">Our doctor profiles will be available shortly</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                {doctor.image && (
                  <div className="h-64 bg-cover bg-center rounded-t-lg" 
                       style={{ backgroundImage: `url(${doctor.image})` }} />
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
      </div>
    </div>
  );
};

export default Doctors;
