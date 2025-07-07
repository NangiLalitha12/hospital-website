
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getHealthRecords, deleteHealthRecord, addHealthRecord, updateHealthRecord, uploadHealthRecordFile } from '@/services/firebase';
import { HealthRecord } from '@/types';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { FileText, Trash2, Download, Plus, Edit } from 'lucide-react';

const HealthRecordsManager = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null as File | null
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await getHealthRecords();
      setRecords(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch health records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this health record?')) return;
    
    // Optimistic update - remove from UI immediately
    const originalRecords = [...records];
    setRecords(prev => prev.filter(record => record.id !== id));
    
    try {
      await deleteHealthRecord(id);
      toast({
        title: "Success",
        description: "Health record deleted successfully",
      });
    } catch (error) {
      // Revert optimistic update on error
      setRecords(originalRecords);
      toast({
        title: "Error",
        description: "Failed to delete health record",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Quick validation
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!editingRecord && !formData.file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      if (editingRecord) {
        // Update existing record
        const updateData: Partial<HealthRecord> = {
          title: formData.title.trim(),
          description: formData.description.trim()
        };

        // Optimistic update - update UI immediately
        const optimisticRecord = { ...editingRecord, ...updateData };
        setRecords(prev => prev.map(record => 
          record.id === editingRecord.id ? optimisticRecord : record
        ));

        // Handle file upload if new file selected
        if (formData.file) {
          const fileUrl = await uploadHealthRecordFile(formData.file, `${Date.now()}_${formData.file.name}`);
          updateData.fileUrl = fileUrl;
          updateData.fileName = formData.file.name;
          updateData.fileType = formData.file.type;
          
          // Update UI with file info
          setRecords(prev => prev.map(record => 
            record.id === editingRecord.id 
              ? { ...record, ...updateData }
              : record
          ));
        }

        // Save to Firebase (runs in background)
        await updateHealthRecord(editingRecord.id!, updateData);

        toast({
          title: "Success",
          description: "Health record updated successfully",
        });
      } else {
        // Add new record
        const fileUrl = await uploadHealthRecordFile(formData.file!, `${Date.now()}_${formData.file!.name}`);
        
        const newRecord: Omit<HealthRecord, 'id'> = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          fileUrl,
          fileName: formData.file!.name,
          fileType: formData.file!.type,
          uploadDate: new Date()
        };

        // Optimistic update - add to UI immediately with temporary ID
        const tempId = `temp_${Date.now()}`;
        const optimisticRecord = { ...newRecord, id: tempId };
        setRecords(prev => [optimisticRecord, ...prev]);

        // Save to Firebase and get real ID
        const recordId = await addHealthRecord(newRecord);
        
        // Update with real ID
        setRecords(prev => prev.map(record => 
          record.id === tempId ? { ...record, id: recordId } : record
        ));

        toast({
          title: "Success",
          description: "Health record added successfully",
        });
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      // Revert optimistic updates on error
      await fetchRecords();
      toast({
        title: "Error",
        description: "Failed to save health record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', file: null });
    setEditingRecord(null);
  };

  const openEditDialog = (record: HealthRecord) => {
    setEditingRecord(record);
    setFormData({
      title: record.title,
      description: record.description,
      file: null
    });
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, file });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Health Records Management</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Health Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? 'Edit Health Record' : 'Add New Health Record'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter record title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter record description"
                  required
                />
              </div>
              <div>
                <Label htmlFor="file">
                  {editingRecord ? 'File (optional - leave empty to keep current file)' : 'File'}
                </Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  required={!editingRecord}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Saving...' : editingRecord ? 'Update' : 'Add'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Health Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading records...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No health records found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">{record.title}</h3>
                      <p className="text-sm text-gray-600">{record.description}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded on: {format(record.uploadDate, 'PPP')}
                      </p>
                      <p className="text-xs text-gray-500">
                        File: {record.fileName} ({record.fileType})
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(record.fileUrl, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(record)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(record.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthRecordsManager;
