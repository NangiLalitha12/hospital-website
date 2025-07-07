
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, FileText, Download, RefreshCw } from 'lucide-react';
import { getHealthRecords } from '@/services/firebase';
import { HealthRecord } from '@/types';

const HealthRecords = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      console.log('Fetching health records for patient view...');
      const recordsData = await getHealthRecords();
      console.log('Patient view - fetched records:', recordsData);
      setRecords(recordsData);
    } catch (error) {
      console.error('Error fetching health records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    
    // Auto-refresh every 30 seconds to show new records
    const interval = setInterval(fetchRecords, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Health Records</h1>
          <p className="text-lg text-gray-600">Secure access to your medical information</p>
        </div>

        {/* Security Notice */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Your Privacy is Protected</h3>
                <p className="text-blue-800 text-sm">
                  All health records are encrypted and stored securely in compliance with HIPAA regulations. 
                  Only authorized healthcare providers have access to your medical information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Records */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Available Health Records
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchRecords}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-gray-600 text-sm">Loading records...</p>
            ) : records.length > 0 ? (
              <div className="space-y-3">
                {records.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div>
                        <span className="text-sm font-medium">{record.title}</span>
                        <p className="text-xs text-gray-500">{record.description}</p>
                        <p className="text-xs text-gray-400">
                          Uploaded: {record.uploadDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(record.fileUrl, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No health records available</p>
                <p className="text-sm text-gray-500">
                  Records will appear here once uploaded by your healthcare provider
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthRecords;
