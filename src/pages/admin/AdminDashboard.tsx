
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Calendar, Clock, User, Phone, Mail, FileText, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  getServices, 
  addService, 
  updateService, 
  deleteService,
  getDoctors,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  getAppointments,
  updateAppointmentStatus,
  getHealthRecords,
  addHealthRecord,
  deleteHealthRecord,
  getMessages,
  deleteMessage
} from '@/services/firebase';
import { Service, Doctor, Appointment, HealthRecord, ContactMessage } from '@/types';
import { format } from 'date-fns';

const AdminDashboard = () => {
  // Services State and Functions
  const [services, setServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState<Omit<Service, 'id'>>({ 
    name: '', 
    description: '', 
    image: '', 
    icon: '' 
  });
  const [editService, setEditService] = useState<Service | null>(null);

  // Doctors State and Functions
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [newDoctor, setNewDoctor] = useState<Omit<Doctor, 'id'>>({ 
    name: '', 
    specialty: '', 
    bio: '', 
    image: '', 
    availability: [], 
    qualifications: [] 
  });
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);

  // Appointments State and Functions
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Health Records State and Functions
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [newHealthRecord, setNewHealthRecord] = useState<Omit<HealthRecord, 'id'>>({ 
    title: '', 
    description: '', 
    fileUrl: '', 
    fileName: '', 
    fileType: '', 
    uploadDate: new Date() 
  });
  const [uploading, setUploading] = useState(false);

  // Messages State and Functions
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching admin dashboard data...');
      
      // Fetch Services
      const servicesData = await getServices();
      console.log('Services fetched:', servicesData);
      setServices(servicesData);

      // Fetch Doctors
      const doctorsData = await getDoctors();
      console.log('Doctors fetched:', doctorsData);
      setDoctors(doctorsData);

      // Fetch Appointments
      const appointmentsData = await getAppointments();
      console.log('Appointments fetched:', appointmentsData);
      setAppointments(appointmentsData);

      // Fetch Health Records
      const healthRecordsData = await getHealthRecords();
      console.log('Health records fetched:', healthRecordsData);
      setHealthRecords(healthRecordsData);

      // Fetch Messages
      const messagesData = await getMessages();
      console.log('Messages fetched:', messagesData);
      setMessages(messagesData);
    };

    fetchData();
  }, []);

  // --- Services Management ---
  const handleAddService = async () => {
    if (!newService.name || !newService.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    await addService(newService);
    const updatedServices = await getServices();
    setServices(updatedServices);
    setNewService({ name: '', description: '', image: '', icon: '' });
    toast({
      title: "Service Added",
      description: "New service has been added successfully.",
    });
  };

  const handleUpdateService = async () => {
    if (!editService?.id) return;
    await updateService(editService.id, editService);
    const updatedServices = await getServices();
    setServices(updatedServices);
    setEditService(null);
    toast({
      title: "Service Updated",
      description: "Service has been updated successfully.",
    });
  };

  const handleDeleteService = async (id: string) => {
    await deleteService(id);
    const updatedServices = await getServices();
    setServices(updatedServices);
    toast({
      title: "Service Deleted",
      description: "Service has been deleted successfully.",
    });
  };

  // --- Doctors Management ---
  const handleAddDoctor = async () => {
    if (!newDoctor.name || !newDoctor.specialty) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    await addDoctor(newDoctor);
    const updatedDoctors = await getDoctors();
    setDoctors(updatedDoctors);
    setNewDoctor({ name: '', specialty: '', bio: '', image: '', availability: [], qualifications: [] });
    toast({
      title: "Doctor Added",
      description: "New doctor has been added successfully.",
    });
  };

  const handleUpdateDoctor = async () => {
    if (!editDoctor?.id) return;
    await updateDoctor(editDoctor.id, editDoctor);
    const updatedDoctors = await getDoctors();
    setDoctors(updatedDoctors);
    setEditDoctor(null);
    toast({
      title: "Doctor Updated",
      description: "Doctor has been updated successfully.",
    });
  };

  const handleDeleteDoctor = async (id: string) => {
    await deleteDoctor(id);
    const updatedDoctors = await getDoctors();
    setDoctors(updatedDoctors);
    toast({
      title: "Doctor Deleted",
      description: "Doctor has been deleted successfully.",
    });
  };

  // --- Appointments Management ---
  const handleUpdateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    await updateAppointmentStatus(id, status);
    const updatedAppointments = await getAppointments();
    setAppointments(updatedAppointments);
    toast({
      title: "Appointment Updated",
      description: "Appointment status has been updated successfully.",
    });
  };

  // --- Health Records Management ---
  const handleAddHealthRecord = async () => {
    if (!newHealthRecord.title || !newHealthRecord.fileUrl) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      await addHealthRecord(newHealthRecord);
      const updatedHealthRecords = await getHealthRecords();
      setHealthRecords(updatedHealthRecords);
      setNewHealthRecord({ title: '', description: '', fileUrl: '', fileName: '', fileType: '', uploadDate: new Date() });
      toast({
        title: "Health Record Added",
        description: "New health record has been added successfully.",
      });
    } catch (error) {
      console.error("Error adding health record:", error);
      toast({
        title: "Error",
        description: "Failed to add health record.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteHealthRecord = async (id: string) => {
    await deleteHealthRecord(id);
    const updatedHealthRecords = await getHealthRecords();
    setHealthRecords(updatedHealthRecords);
    toast({
      title: "Health Record Deleted",
      description: "Health record has been deleted successfully.",
    });
  };

  // --- Messages Management ---
  const handleDeleteMessage = async (id: string) => {
    await deleteMessage(id);
    const updatedMessages = await getMessages();
    setMessages(updatedMessages);
    toast({
      title: "Message Deleted",
      description: "Message has been deleted successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your hospital website content</p>
        </div>

        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="health-records">Health Records</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Manage Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Add Service Form */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Add New Service</h3>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={newService.name}
                          onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newService.description}
                          onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="image">Image URL</Label>
                        <Input
                          id="image"
                          value={newService.image}
                          onChange={(e) => setNewService({ ...newService, image: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="icon">Icon</Label>
                        <Input
                          id="icon"
                          value={newService.icon}
                          onChange={(e) => setNewService({ ...newService, icon: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleAddService}>Add Service</Button>
                    </div>
                  </div>

                  {/* Services List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Current Services</h3>
                    <div className="space-y-2">
                      {services.map((service) => (
                        <div key={service.id} className="flex items-center justify-between border rounded-md p-2">
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-gray-500">{service.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setEditService(service)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteService(service.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Edit Service Modal */}
                {editService && (
                  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                      <h3 className="text-lg font-semibold mb-2">Edit Service</h3>
                      <div className="space-y-2">
                        <div>
                          <Label htmlFor="edit-name">Name</Label>
                          <Input
                            id="edit-name"
                            value={editService.name}
                            onChange={(e) => setEditService({ ...editService, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-description">Description</Label>
                          <Textarea
                            id="edit-description"
                            value={editService.description}
                            onChange={(e) => setEditService({ ...editService, description: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-image">Image URL</Label>
                          <Input
                            id="edit-image"
                            value={editService.image}
                            onChange={(e) => setEditService({ ...editService, image: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-icon">Icon</Label>
                          <Input
                            id="edit-icon"
                            value={editService.icon}
                            onChange={(e) => setEditService({ ...editService, icon: e.target.value })}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" onClick={() => setEditService(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateService}>Update Service</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Doctors Tab */}
          <TabsContent value="doctors">
            <Card>
              <CardHeader>
                <CardTitle>Manage Doctors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Add Doctor Form */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Add New Doctor</h3>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="doctor-name">Name</Label>
                        <Input
                          id="doctor-name"
                          value={newDoctor.name}
                          onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="doctor-specialty">Specialty</Label>
                        <Input
                          id="doctor-specialty"
                          value={newDoctor.specialty}
                          onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="doctor-bio">Bio</Label>
                        <Textarea
                          id="doctor-bio"
                          value={newDoctor.bio}
                          onChange={(e) => setNewDoctor({ ...newDoctor, bio: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="doctor-image">Image URL</Label>
                        <Input
                          id="doctor-image"
                          value={newDoctor.image}
                          onChange={(e) => setNewDoctor({ ...newDoctor, image: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleAddDoctor}>Add Doctor</Button>
                    </div>
                  </div>

                  {/* Doctors List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Current Doctors</h3>
                    <div className="space-y-2">
                      {doctors.map((doctor) => (
                        <div key={doctor.id} className="flex items-center justify-between border rounded-md p-2">
                          <div>
                            <p className="font-medium">{doctor.name}</p>
                            <p className="text-sm text-gray-500">{doctor.specialty}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setEditDoctor(doctor)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteDoctor(doctor.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Edit Doctor Modal */}
                {editDoctor && (
                  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                      <h3 className="text-lg font-semibold mb-2">Edit Doctor</h3>
                      <div className="space-y-2">
                        <div>
                          <Label htmlFor="edit-doctor-name">Name</Label>
                          <Input
                            id="edit-doctor-name"
                            value={editDoctor.name}
                            onChange={(e) => setEditDoctor({ ...editDoctor, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-doctor-specialty">Specialty</Label>
                          <Input
                            id="edit-doctor-specialty"
                            value={editDoctor.specialty}
                            onChange={(e) => setEditDoctor({ ...editDoctor, specialty: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-doctor-bio">Bio</Label>
                          <Textarea
                            id="edit-doctor-bio"
                            value={editDoctor.bio}
                            onChange={(e) => setEditDoctor({ ...editDoctor, bio: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-doctor-image">Image URL</Label>
                          <Input
                            id="edit-doctor-image"
                            value={editDoctor.image}
                            onChange={(e) => setEditDoctor({ ...editDoctor, image: e.target.value })}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" onClick={() => setEditDoctor(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateDoctor}>Update Doctor</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Manage Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient Name
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Doctor Name
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 bg-gray-50"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {appointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {appointment.patientName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {appointment.doctorName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(appointment.date), 'PPP')} at {appointment.time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Badge className={`
                              ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                              ${appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                              ${appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                            `}>
                              {appointment.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <select
                              className="border rounded px-2 py-1"
                              value={appointment.status}
                              onChange={(e) => handleUpdateAppointmentStatus(appointment.id!, e.target.value as Appointment['status'])}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Records Tab */}
          <TabsContent value="health-records">
            <Card>
              <CardHeader>
                <CardTitle>Manage Health Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Add Health Record Form */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Add New Health Record</h3>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="record-title">Title</Label>
                        <Input
                          id="record-title"
                          value={newHealthRecord.title}
                          onChange={(e) => setNewHealthRecord({ ...newHealthRecord, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="record-description">Description</Label>
                        <Textarea
                          id="record-description"
                          value={newHealthRecord.description}
                          onChange={(e) => setNewHealthRecord({ ...newHealthRecord, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="record-fileUrl">File URL</Label>
                        <Input
                          id="record-fileUrl"
                          type="url"
                          value={newHealthRecord.fileUrl}
                          onChange={(e) => setNewHealthRecord({ ...newHealthRecord, fileUrl: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="record-fileName">File Name</Label>
                        <Input
                          id="record-fileName"
                          value={newHealthRecord.fileName}
                          onChange={(e) => setNewHealthRecord({ ...newHealthRecord, fileName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="record-fileType">File Type</Label>
                        <Input
                          id="record-fileType"
                          value={newHealthRecord.fileType}
                          onChange={(e) => setNewHealthRecord({ ...newHealthRecord, fileType: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleAddHealthRecord} disabled={uploading}>
                        {uploading ? 'Adding...' : 'Add Health Record'}
                      </Button>
                    </div>
                  </div>

                  {/* Health Records List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Current Health Records</h3>
                    <div className="space-y-2">
                      {healthRecords.map((record) => (
                        <div key={record.id} className="flex items-center justify-between border rounded-md p-2">
                          <div>
                            <p className="font-medium">{record.title}</p>
                            <p className="text-sm text-gray-500">{record.description}</p>
                            <p className="text-xs text-gray-400">{record.fileName}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteHealthRecord(record.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Contact Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Message
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 bg-gray-50"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {messages.map((message) => (
                        <tr key={message.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {message.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {message.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {message.phone}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {message.message}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(message.createdAt, 'PPP')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteMessage(message.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
