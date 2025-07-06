
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Enhanced Background */}
      <section 
        className="relative bg-gradient-to-br from-indigo-600/90 via-purple-600/90 to-pink-600/90 text-white py-32 bg-cover bg-center bg-blend-overlay"
        style={{
          backgroundImage: content?.bannerImage 
            ? `url(${content.bannerImage})` 
            : 'url("https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-purple-800/80 to-pink-700/80"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight animate-fade-in bg-gradient-to-r from-white via-pink-100 to-indigo-100 bg-clip-text text-transparent">
              {content?.bannerTitle || 'Your Trusted Healthcare Partner'}
            </h1>
            <p className="text-xl md:text-3xl mb-12 opacity-95 max-w-4xl mx-auto leading-relaxed animate-fade-in">
              {content?.bannerSubtitle || 'Providing exceptional healthcare services with compassion and expertise'}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-4 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-200 shadow-lg border-0">
                <Link to="/appointment">Book Appointment</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-white/80 text-white hover:bg-white/10 hover:border-white px-8 py-4 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-200 backdrop-blur-sm">
                <Link to="/services">Our Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section with Enhanced Colors */}
      <section className="py-20 bg-gradient-to-b from-indigo-50 via-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              {content?.welcomeMessage || 'Welcome to Our Healthcare Center'}
            </h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              {content?.introText || 'We are committed to providing the highest quality healthcare services with state-of-the-art facilities and compassionate care from our expert medical professionals.'}
            </p>
          </div>
        </div>
      </section>

      {/* Features Section with Enhanced Colors */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-600">Experience healthcare excellence with our comprehensive services</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-indigo-50 via-blue-50 to-white shadow-lg">
              <CardContent className="pt-6">
                <div className="bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-md">
                  <Calendar className="h-10 w-10 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Easy Booking</h3>
                <p className="text-gray-600 leading-relaxed">Schedule appointments online 24/7 with our user-friendly booking system</p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-emerald-50 via-green-50 to-white shadow-lg">
              <CardContent className="pt-6">
                <div className="bg-gradient-to-br from-emerald-100 to-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-md">
                  <Users className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Expert Doctors</h3>
                <p className="text-gray-600 leading-relaxed">Board-certified specialists with years of experience in their fields</p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-purple-50 via-violet-50 to-white shadow-lg">
              <CardContent className="pt-6">
                <div className="bg-gradient-to-br from-purple-100 to-violet-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-md">
                  <Shield className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Secure Records</h3>
                <p className="text-gray-600 leading-relaxed">Your health data is protected with advanced security measures</p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-rose-50 via-pink-50 to-white shadow-lg">
              <CardContent className="pt-6">
                <div className="bg-gradient-to-br from-rose-100 to-pink-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-md">
                  <Clock className="h-10 w-10 text-rose-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">24/7 Emergency</h3>
                <p className="text-gray-600 leading-relaxed">Round-the-clock emergency care when you need it most</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section with Enhanced Gradient */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Take Care of Your Health?</h2>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-3xl mx-auto">Book an appointment with our expert doctors today and experience healthcare excellence</p>
          <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 px-10 py-5 text-xl font-semibold rounded-full transform hover:scale-105 transition-all duration-200 shadow-lg border-0">
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
