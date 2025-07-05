
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Shield, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getHomeContent } from '@/services/firebase';
import { HomeContent } from '@/types';
import SmartChat from '@/components/SmartChat';

const Home = () => {
  const [content, setContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const homeContent = await getHomeContent();
      setContent(homeContent);
      setLoading(false);
    };
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background */}
      <section 
        className="relative bg-gradient-to-r from-blue-600/90 to-blue-800/90 text-white py-32 bg-cover bg-center bg-blend-overlay"
        style={{
          backgroundImage: content?.bannerImage 
            ? `url(${content.bannerImage})` 
            : 'url("https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-700/80"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight animate-fade-in">
              {content?.bannerTitle || 'Your Trusted Healthcare Partner'}
            </h1>
            <p className="text-xl md:text-3xl mb-12 opacity-95 max-w-4xl mx-auto leading-relaxed animate-fade-in">
              {content?.bannerSubtitle || 'Providing exceptional healthcare services with compassion and expertise'}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-200 shadow-lg">
                <Link to="/appointment">Book Appointment</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-200">
                <Link to="/services">Our Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {content?.welcomeMessage || 'Welcome to Our Healthcare Center'}
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {content?.introText || 'We are committed to providing the highest quality healthcare services with state-of-the-art facilities and compassionate care from our expert medical professionals.'}
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-600">Experience healthcare excellence with our comprehensive services</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="pt-6">
                <div className="bg-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Calendar className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Easy Booking</h3>
                <p className="text-gray-600 leading-relaxed">Schedule appointments online 24/7 with our user-friendly booking system</p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="pt-6">
                <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Users className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Expert Doctors</h3>
                <p className="text-gray-600 leading-relaxed">Board-certified specialists with years of experience in their fields</p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="pt-6">
                <div className="bg-purple-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Shield className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Secure Records</h3>
                <p className="text-gray-600 leading-relaxed">Your health data is protected with advanced security measures</p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-red-50 to-white">
              <CardContent className="pt-6">
                <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Clock className="h-10 w-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">24/7 Emergency</h3>
                <p className="text-gray-600 leading-relaxed">Round-the-clock emergency care when you need it most</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Take Care of Your Health?</h2>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-3xl mx-auto">Book an appointment with our expert doctors today and experience healthcare excellence</p>
          <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-5 text-xl font-semibold rounded-full transform hover:scale-105 transition-all duration-200 shadow-lg">
            <Link to="/appointment">Book Now</Link>
          </Button>
        </div>
      </section>

      {/* Smart Chat Widget */}
      <SmartChat />
    </div>
  );
};

export default Home;
