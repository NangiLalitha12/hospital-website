
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getDoctors, addDoctor, updateDoctor, deleteDoctor } from '@/services/firebase';
import { Doctor } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

const DoctorsManager = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [showForm, setShowForm] = useState(false);
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
        <h2 className="text-2xl font-bold">Doctors Management</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Doctor
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Doctor Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>
              
              <div>
                <Label>Availability</Label>
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
                    className="mt-2"
                  />
                ))}
                <Button type="button" variant="outline" onClick={addAvailabilityField} className="mt-2">
                  Add Availability
                </Button>
              </div>

              <div>
                <Label>Qualifications</Label>
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
                    className="mt-2"
                  />
                ))}
                <Button type="button" variant="outline" onClick={addQualificationField} className="mt-2">
                  Add Qualification
                </Button>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
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
          <Card key={doctor.id}>
            <CardContent className="flex justify-between items-center p-4">
              <div>
                <h3 className="font-semibold">{doctor.name}</h3>
                <p className="text-sm text-gray-600">{doctor.specialty}</p>
                <p className="text-xs text-gray-500">{doctor.bio}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleEdit(doctor)}>
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
