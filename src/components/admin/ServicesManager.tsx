
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getServices, addService, updateService, deleteService } from '@/services/firebase';
import { Service } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Plus, Edit, Trash2, Upload, Settings } from 'lucide-react';

const ServicesManager = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    icon: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const data = await getServices();
    setServices(data);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(file);
      setFormData({ ...formData, image: imageUrl });
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await updateService(editingService.id!, formData);
        toast({ title: "Success", description: "Service updated successfully" });
      } else {
        await addService(formData);
        toast({ title: "Success", description: "Service added successfully" });
      }
      resetForm();
      fetchServices();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save service", variant: "destructive" });
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      image: service.image,
      icon: service.icon
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteService(id);
      toast({ title: "Success", description: "Service deleted successfully" });
      fetchServices();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete service", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({ name: '', description: '', image: '', icon: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Settings className="h-8 w-8 text-green-600" />
          Services Management
        </h2>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {showForm && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <CardTitle>{editingService ? 'Edit Service' : 'Add New Service'}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-700 font-medium">Service Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-gray-700 font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <Label htmlFor="image" className="text-gray-700 font-medium">Service Image</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="border-gray-300 focus:border-green-500"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  </div>
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Service preview"
                      className="w-32 h-20 object-cover rounded-lg border-2 border-gray-200"
                    />
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="icon" className="text-gray-700 font-medium">Icon</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {editingService ? 'Update' : 'Add'} Service
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {services.map((service) => (
          <Card key={service.id} className="bg-white hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
            <CardContent className="flex justify-between items-center p-6">
              <div className="flex items-center gap-4">
                {service.image && (
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleEdit(service)} variant="outline" className="hover:bg-blue-50">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(service.id!)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServicesManager;
