
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, FileText, Download, Upload } from 'lucide-react';
import { getHealthRecords } from '@/services/firebase';
import { HealthRecord } from '@/types';

const HealthRecords = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const recordsData = await getHealthRecords();
        setRecords(recordsData);
      } catch (error) {
        console.error('Error fetching health records:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Available Records */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Available Health Records
              </CardTitle>
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

          {/* Patient Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Patient Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">
                Access additional patient services and request medical information.
              </p>
              
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Request Medical Records
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Lab Results
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Prescription History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Access Your Health Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Verify Identity</h3>
                <p className="text-sm text-gray-600">
                  Provide your patient ID and personal information for secure access
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Browse Records</h3>
                <p className="text-sm text-gray-600">
                  View your complete medical history, lab results, and prescriptions
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Download & Share</h3>
                <p className="text-sm text-gray-600">
                  Download records for your own use or share with other healthcare providers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              If you have trouble accessing your health records or need assistance, please contact our support team:
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline">Call Support: (555) 123-4567</Button>
              <Button variant="outline">Email: records@medicare.com</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthRecords;
