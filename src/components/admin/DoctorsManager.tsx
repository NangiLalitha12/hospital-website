
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getDoctors, addDoctor, updateDoctor, deleteDoctor } from '@/services/firebase';
import { Doctor } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Plus, Edit, Trash2, Upload, UserCheck } from 'lucide-react';

const DoctorsManager = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    bio: '',
    image: '',
    availability: [''],
    qualifications: ['']
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    const data = await getDoctors();
    setDoctors(data);
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
      const doctorData = {
        ...formData,
        availability: formData.availability.filter(a => a.trim()),
        qualifications: formData.qualifications.filter(q => q.trim())
      };

      if (editingDoctor) {
        await updateDoctor(editingDoctor.id!, doctorData);
        toast({ title: "Success", description: "Doctor updated successfully" });
      } else {
        await addDoctor(doctorData);
        toast({ title: "Success", description: "Doctor added successfully" });
      }
      resetForm();
      fetchDoctors();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save doctor", variant: "destructive" });
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      specialty: doctor.specialty,
      bio: doctor.bio,
      image: doctor.image,
      availability: doctor.availability.length ? doctor.availability : [''],
      qualifications: doctor.qualifications.length ? doctor.qualifications : ['']
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoctor(id);
      toast({ title: "Success", description: "Doctor deleted successfully" });
      fetchDoctors();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete doctor", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingDoctor(null);
    setFormData({
      name: '',
      specialty: '',
      bio: '',
      image: '',
      availability: [''],
      qualifications: ['']
    });
    setShowForm(false);
  };

  const addAvailabilityField = () => {
    setFormData({ ...formData, availability: [...formData.availability, ''] });
  };

  const addQualificationField = () => {
    setFormData({ ...formData, qualifications: [...formData.qualifications, ''] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <UserCheck className="h-8 w-8 text-purple-600" />
          Doctors Management
        </h2>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Doctor
        </Button>
      </div>

      {showForm && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
            <CardTitle>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-700 font-medium">Doctor Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <Label htmlFor="specialty" className="text-gray-700 font-medium">Specialty</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  required
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <Label htmlFor="bio" className="text-gray-700 font-medium">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  required
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <Label htmlFor="image" className="text-gray-700 font-medium">Doctor Photo</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="border-gray-300 focus:border-purple-500"
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
                      alt="Doctor preview"
                      className="w-32 h-32 object-cover rounded-full border-4 border-gray-200"
                    />
                  )}
                </div>
              </div>
              
              <div>
                <Label className="text-gray-700 font-medium">Availability</Label>
                {formData.availability.map((availability, index) => (
                  <Input
                    key={index}
                    value={availability}
                    onChange={(e) => {
                      const newAvailability = [...formData.availability];
                      newAvailability[index] = e.target.value;
                      setFormData({ ...formData, availability: newAvailability });
                    }}
                    placeholder="e.g., Monday 9:00 AM - 5:00 PM"
                    className="mt-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                ))}
                <Button type="button" variant="outline" onClick={addAvailabilityField} className="mt-2">
                  Add Availability
                </Button>
              </div>

              <div>
                <Label className="text-gray-700 font-medium">Qualifications</Label>
                {formData.qualifications.map((qualification, index) => (
                  <Input
                    key={index}
                    value={qualification}
                    onChange={(e) => {
                      const newQualifications = [...formData.qualifications];
                      newQualifications[index] = e.target.value;
                      setFormData({ ...formData, qualifications: newQualifications });
                    }}
                    placeholder="e.g., MD from Harvard Medical School"
                    className="mt-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                ))}
                <Button type="button" variant="outline" onClick={addQualificationField} className="mt-2">
                  Add Qualification
                </Button>
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {editingDoctor ? 'Update' : 'Add'} Doctor
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
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="bg-white hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
            <CardContent className="flex justify-between items-center p-6">
              <div className="flex items-center gap-4">
                {doctor.image && (
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-16 h-16 object-cover rounded-full border-2 border-gray-200"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{doctor.name}</h3>
                  <p className="text-sm text-purple-600 font-medium">{doctor.specialty}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">{doctor.bio}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleEdit(doctor)} variant="outline" className="hover:bg-blue-50">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(doctor.id!)}>
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

export default DoctorsManager;
