
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getHealthRecords, deleteHealthRecord } from '@/services/firebase';
import { HealthRecord } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { FileText, Trash2, Download } from 'lucide-react';

const HealthRecordsManager = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(false);

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
    try {
      await deleteHealthRecord(id);
      toast({
        title: "Success",
        description: "Health record deleted successfully",
      });
      fetchRecords();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete health record",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Health Records Management</h2>
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
