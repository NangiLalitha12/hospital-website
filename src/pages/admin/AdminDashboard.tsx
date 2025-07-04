import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home, 
  Settings, 
  Users, 
  Calendar, 
  FileText, 
  Phone, 
  LogOut,
  Upload,
  Trash2,
  Edit,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { 
  getHomeContent, 
  updateHomeContent,
  getServices,
  addService,
  updateService,
  deleteService,
  getDoctors,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  getContactInfo,
  updateContactInfo,
  getAppointments,
  updateAppointmentStatus,
  getHealthRecords,
  addHealthRecord,
  deleteHealthRecord,
  getMessages,
  deleteMessage
} from '@/services/firebase';
import { HomeContent, Service, Doctor, ContactInfo, Appointment, HealthRecord, ContactMessage } from '@/types';
import { toast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the admin panel.",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Home Content', href: '/admin/home', icon: FileText },
    { name: 'Services', href: '/admin/services', icon: Settings },
    { name: 'Doctors', href: '/admin/doctors', icon: Users },
    { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
    { name: 'Health Records', href: '/admin/health-records', icon: FileText },
    { name: 'Contact Info', href: '/admin/contact', icon: Phone },
    { name: 'Messages', href: '/admin/messages', icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-4 overflow-x-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  location.pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/home" element={<HomeContentManager />} />
          <Route path="/services" element={<ServicesManager />} />
          <Route path="/doctors" element={<DoctorsManager />} />
          <Route path="/appointments" element={<AppointmentsManager />} />
          <Route path="/health-records" element={<HealthRecordsManager />} />
          <Route path="/contact" element={<ContactManager />} />
          <Route path="/messages" element={<MessagesManager />} />
        </Routes>
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview = () => {
  const [stats, setStats] = useState({
    appointments: 0,
    doctors: 0,
    services: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [appointments, doctors, services] = await Promise.all([
        getAppointments(),
        getDoctors(),
        getServices(),
      ]);
      setStats({
        appointments: appointments.length,
        doctors: doctors.length,
        services: services.length,
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.appointments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.doctors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Services Offered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.services}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Home Content Manager Component
const HomeContentManager = () => {
  const [content, setContent] = useState<HomeContent>({
    bannerTitle: '',
    bannerSubtitle: '',
    bannerImage: '',
    welcomeMessage: '',
    introText: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      const homeContent = await getHomeContent();
      if (homeContent) {
        setContent(homeContent);
      }
    };
    fetchContent();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(file);
      setContent(prev => ({ ...prev, bannerImage: imageUrl }));
      toast({
        title: "Image uploaded successfully",
        description: "The banner image has been updated.",
      });
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateHomeContent(content);
      toast({
        title: "Content updated",
        description: "Home page content has been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Update failed",
        description: "Failed to update content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Home Page Content</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="bannerTitle">Banner Title</Label>
            <Input
              id="bannerTitle"
              value={content.bannerTitle}
              onChange={(e) => setContent(prev => ({ ...prev, bannerTitle: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="bannerSubtitle">Banner Subtitle</Label>
            <Input
              id="bannerSubtitle"
              value={content.bannerSubtitle}
              onChange={(e) => setContent(prev => ({ ...prev, bannerSubtitle: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="bannerImage">Banner Image</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
            </div>
            {content.bannerImage && (
              <img src={content.bannerImage} alt="Banner" className="mt-2 h-32 object-cover rounded" />
            )}
          </div>

          <div>
            <Label htmlFor="welcomeMessage">Welcome Message</Label>
            <Input
              id="welcomeMessage"
              value={content.welcomeMessage}
              onChange={(e) => setContent(prev => ({ ...prev, welcomeMessage: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="introText">Introduction Text</Label>
            <Textarea
              id="introText"
              value={content.introText}
              onChange={(e) => setContent(prev => ({ ...prev, introText: e.target.value }))}
              rows={4}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Services Manager Component
const ServicesManager = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const servicesData = await getServices();
    setServices(servicesData);
  };

  const handleAddService = async (serviceData: Omit<Service, 'id'>) => {
    try {
      await addService(serviceData);
      toast({
        title: "Service added",
        description: "New service has been added successfully.",
      });
      fetchServices();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding service:', error);
      toast({
        title: "Add failed",
        description: "Failed to add service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditService = async (id: string, serviceData: Partial<Service>) => {
    try {
      await updateService(id, serviceData);
      toast({
        title: "Service updated",
        description: "Service has been updated successfully.",
      });
      fetchServices();
      setEditingService(null);
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: "Update failed",
        description: "Failed to update service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    try {
      await deleteService(id);
      toast({
        title: "Service deleted",
        description: "Service has been deleted successfully.",
      });
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete service. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Services Management</h2>
        <Button onClick={() => setShowAddForm(true)}>Add Service</Button>
      </div>

      {/* Add/Edit Service Form */}
      {(showAddForm || editingService) && (
        <ServiceForm
          service={editingService}
          onSubmit={editingService 
            ? (data) => handleEditService(editingService.id!, data)
            : handleAddService
          }
          onCancel={() => {
            setShowAddForm(false);
            setEditingService(null);
          }}
        />
      )}

      {/* Services List */}
      <div className="grid gap-4">
        {services.map((service) => (
          <Card key={service.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  <p className="text-gray-600 mt-1">{service.description}</p>
                  {service.image && (
                    <img src={service.image} alt={service.name} className="mt-2 h-20 object-cover rounded" />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingService(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteService(service.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Service Form Component
const ServiceForm = ({ 
  service, 
  onSubmit, 
  onCancel 
}: { 
  service?: Service | null; 
  onSubmit: (data: any) => void; 
  onCancel: () => void; 
}) => {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    image: service?.image || '',
    icon: service?.icon || '',
  });
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, image: imageUrl }));
      toast({
        title: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: "Upload failed",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{service ? 'Edit Service' : 'Add New Service'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="image">Service Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            {formData.image && (
              <img src={formData.image} alt="Service" className="mt-2 h-32 object-cover rounded" />
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={uploading}>
              {service ? 'Update Service' : 'Add Service'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Enhanced Doctors Manager Component
const DoctorsManager = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    const doctorsData = await getDoctors();
    setDoctors(doctorsData);
  };

  const handleAddDoctor = async (doctorData: Omit<Doctor, 'id'>) => {
    try {
      await addDoctor(doctorData);
      toast({
        title: "Doctor added",
        description: "New doctor has been added successfully.",
      });
      fetchDoctors();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding doctor:', error);
      toast({
        title: "Add failed",
        description: "Failed to add doctor. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditDoctor = async (id: string, doctorData: Partial<Doctor>) => {
    try {
      await updateDoctor(id, doctorData);
      toast({
        title: "Doctor updated",
        description: "Doctor has been updated successfully.",
      });
      fetchDoctors();
      setEditingDoctor(null);
    } catch (error) {
      console.error('Error updating doctor:', error);
      toast({
        title: "Update failed",
        description: "Failed to update doctor. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;

    try {
      await deleteDoctor(id);
      toast({
        title: "Doctor deleted",
        description: "Doctor has been deleted successfully.",
      });
      fetchDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete doctor. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Doctors Management</h2>
        <Button onClick={() => setShowAddForm(true)}>Add Doctor</Button>
      </div>

      {/* Add/Edit Doctor Form */}
      {(showAddForm || editingDoctor) && (
        <DoctorForm
          doctor={editingDoctor}
          onSubmit={editingDoctor 
            ? (data) => handleEditDoctor(editingDoctor.id!, data)
            : handleAddDoctor
          }
          onCancel={() => {
            setShowAddForm(false);
            setEditingDoctor(null);
          }}
        />
      )}

      {/* Doctors List */}
      <div className="grid gap-4">
        {doctors.map((doctor) => (
          <Card key={doctor.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 flex-1">
                  {doctor.image && (
                    <img src={doctor.image} alt={doctor.name} className="w-20 h-20 object-cover rounded-full" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Dr. {doctor.name}</h3>
                    <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                    <p className="text-gray-600 mt-1 text-sm">{doctor.bio}</p>
                    <div className="mt-2">
                      <p className="text-sm font-medium">Qualifications:</p>
                      <ul className="text-sm text-gray-600">
                        {doctor.qualifications.map((qual, index) => (
                          <li key={index}>• {qual}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingDoctor(doctor)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteDoctor(doctor.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Doctor Form Component
const DoctorForm = ({ 
  doctor, 
  onSubmit, 
  onCancel 
}: { 
  doctor?: Doctor | null; 
  onSubmit: (data: any) => void; 
  onCancel: () => void; 
}) => {
  const [formData, setFormData] = useState({
    name: doctor?.name || '',
    specialty: doctor?.specialty || '',
    bio: doctor?.bio || '',
    image: doctor?.image || '',
    availability: doctor?.availability || [],
    qualifications: doctor?.qualifications || [''],
  });
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, image: imageUrl }));
      toast({
        title: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: "Upload failed",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleQualificationChange = (index: number, value: string) => {
    const newQualifications = [...formData.qualifications];
    newQualifications[index] = value;
    setFormData(prev => ({ ...prev, qualifications: newQualifications }));
  };

  const addQualification = () => {
    setFormData(prev => ({ ...prev, qualifications: [...prev.qualifications, ''] }));
  };

  const removeQualification = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      qualifications: prev.qualifications.filter((_, i) => i !== index) 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedData = {
      ...formData,
      qualifications: formData.qualifications.filter(q => q.trim() !== '')
    };
    onSubmit(cleanedData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{doctor ? 'Edit Doctor' : 'Add New Doctor'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Doctor Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="specialty">Specialty</Label>
            <Input
              id="specialty"
              value={formData.specialty}
              onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="image">Doctor Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            {formData.image && (
              <img src={formData.image} alt="Doctor" className="mt-2 h-32 w-32 object-cover rounded-full" />
            )}
          </div>

          <div>
            <Label>Qualifications</Label>
            {formData.qualifications.map((qualification, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  value={qualification}
                  onChange={(e) => handleQualificationChange(index, e.target.value)}
                  placeholder="Enter qualification"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeQualification(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addQualification}
              className="mt-2"
            >
              Add Qualification
            </Button>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={uploading}>
              {doctor ? 'Update Doctor' : 'Add Doctor'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Health Records Manager Component
const HealthRecordsManager = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const recordsData = await getHealthRecords();
    setRecords(recordsData);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileUrl = await uploadToCloudinary(file);
      await addHealthRecord({
        title: file.name,
        description: `Health record uploaded on ${new Date().toLocaleDateString()}`,
        fileUrl: fileUrl,
        fileName: file.name,
        uploadDate: new Date(),
        fileType: file.type
      });
      
      toast({
        title: "Health record uploaded",
        description: "Health record has been uploaded successfully.",
      });
      fetchRecords();
    } catch (error) {
      console.error('Error uploading health record:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload health record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      await deleteHealthRecord(id);
      toast({
        title: "Record deleted",
        description: "Health record has been deleted successfully.",
      });
      fetchRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete record. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Health Records Management</h2>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Health Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
            <p className="text-sm text-gray-600">
              Supported formats: PDF, DOC, DOCX, JPG, PNG
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Records List */}
      <div className="grid gap-4">
        {records.map((record) => (
          <Card key={record.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{record.title}</h3>
                  <p className="text-gray-600 mt-1">{record.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Uploaded: {record.uploadDate.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">File: {record.fileName}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(record.fileUrl, '_blank')}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRecord(record.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Enhanced Contact Manager Component
const ContactManager = () => {
  const [contact, setContact] = useState<ContactInfo>({
    phone: '',
    email: '',
    address: '',
    hours: '',
    emergencyNumber: '',
    chatWidget: '',
    location: '',
    getInTouchMessage: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContact = async () => {
      const contactInfo = await getContactInfo();
      if (contactInfo) {
        setContact(contactInfo);
      }
    };
    fetchContact();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateContactInfo(contact);
      toast({
        title: "Contact info updated",
        description: "Contact information has been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating contact info:', error);
      toast({
        title: "Update failed",
        description: "Failed to update contact info. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={contact.phone}
              onChange={(e) => setContact(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={contact.email}
              onChange={(e) => setContact(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={contact.address}
              onChange={(e) => setContact(prev => ({ ...prev, address: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="location">Location (Map Embed URL)</Label>
            <Input
              id="location"
              value={contact.location || ''}
              onChange={(e) => setContact(prev => ({ ...prev, location: e.target.value }))}
              placeholder="https://www.google.com/maps/embed?..."
            />
          </div>

          <div>
            <Label htmlFor="hours">Operating Hours</Label>
            <Textarea
              id="hours"
              value={contact.hours}
              onChange={(e) => setContact(prev => ({ ...prev, hours: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="emergencyNumber">Emergency Number</Label>
            <Input
              id="emergencyNumber"
              value={contact.emergencyNumber}
              onChange={(e) => setContact(prev => ({ ...prev, emergencyNumber: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="getInTouchMessage">Get In Touch Message</Label>
            <Textarea
              id="getInTouchMessage"
              value={contact.getInTouchMessage || ''}
              onChange={(e) => setContact(prev => ({ ...prev, getInTouchMessage: e.target.value }))}
              rows={3}
              placeholder="Enter a message to display on the contact page"
            />
          </div>

          <div>
            <Label htmlFor="chatWidget">Chat Widget Code</Label>
            <Textarea
              id="chatWidget"
              value={contact.chatWidget}
              onChange={(e) => setContact(prev => ({ ...prev, chatWidget: e.target.value }))}
              rows={4}
              placeholder="Paste your chat widget embed code here"
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Messages Manager Component
const MessagesManager = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const messagesData = await getMessages();
    setMessages(messagesData);
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await deleteMessage(id);
      toast({
        title: "Message deleted",
        description: "Message has been deleted successfully.",
      });
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Contact Messages</h2>

      <div className="grid gap-4">
        {messages.map((message) => (
          <Card key={message.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{message.name}</h3>
                  <p className="text-gray-600 text-sm">{message.email}</p>
                  <p className="text-gray-600 text-sm">{message.phone}</p>
                  <p className="mt-2">{message.message}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Received: {message.createdAt.toLocaleDateString()} {message.createdAt.toLocaleTimeString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteMessage(message.id!)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {messages.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No messages received yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Appointments Manager Component  
const AppointmentsManager = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const appointmentsData = await getAppointments();
      setAppointments(appointmentsData);
    };
    fetchAppointments();
  }, []);

  const handleStatusChange = async (id: string, status: Appointment['status']) => {
    try {
      await updateAppointmentStatus(id, status);
      toast({
        title: "Appointment updated",
        description: "Appointment status has been updated.",
      });
      const appointmentsData = await getAppointments();
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Update failed",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointments Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="border p-4 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{appointment.patientName}</h3>
                  <p className="text-sm text-gray-600">Dr. {appointment.doctorName}</p>
                  <p className="text-sm">{appointment.date} at {appointment.time}</p>
                  <p className="text-sm text-gray-600">{appointment.patientEmail}</p>
                  <p className="text-sm text-gray-600">{appointment.patientPhone}</p>
                  {appointment.reason && <p className="text-sm mt-1"><strong>Reason:</strong> {appointment.reason}</p>}
                </div>
                <div className="space-x-2">
                  <Badge className={
                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {appointment.status}
                  </Badge>
                  <div className="mt-2 space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(appointment.id!, 'confirmed')}
                      disabled={appointment.status === 'confirmed'}
                    >
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(appointment.id!, 'cancelled')}
                      disabled={appointment.status === 'cancelled'}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;
