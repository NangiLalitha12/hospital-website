
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getHomeContent, updateHomeContent } from '@/services/firebase';
import { HomeContent } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Upload, Image } from 'lucide-react';

const HomeEditor = () => {
  const [content, setContent] = useState<HomeContent>({
    bannerTitle: '',
    bannerSubtitle: '',
    bannerImage: '',
    welcomeMessage: '',
    introText: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      const data = await getHomeContent();
      if (data) setContent(data);
    };
    fetchContent();
  }, []);

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
      setContent({ ...content, bannerImage: imageUrl });
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

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateHomeContent(content);
      toast({
        title: "Success",
        description: "Home content updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update home content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Edit Home Page Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-2">
          <Label htmlFor="bannerTitle" className="text-gray-700 font-medium">Banner Title</Label>
          <Input
            id="bannerTitle"
            value={content.bannerTitle}
            onChange={(e) => setContent({ ...content, bannerTitle: e.target.value })}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bannerSubtitle" className="text-gray-700 font-medium">Banner Subtitle</Label>
          <Input
            id="bannerSubtitle"
            value={content.bannerSubtitle}
            onChange={(e) => setContent({ ...content, bannerSubtitle: e.target.value })}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bannerImage" className="text-gray-700 font-medium">Banner Image</Label>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Input
                id="bannerImage"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="border-gray-300 focus:border-blue-500"
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
            {content.bannerImage && (
              <div className="mt-2">
                <img
                  src={content.bannerImage}
                  alt="Banner preview"
                  className="w-32 h-20 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="welcomeMessage" className="text-gray-700 font-medium">Welcome Message</Label>
          <Textarea
            id="welcomeMessage"
            value={content.welcomeMessage}
            onChange={(e) => setContent({ ...content, welcomeMessage: e.target.value })}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="introText" className="text-gray-700 font-medium">Intro Text</Label>
          <Textarea
            id="introText"
            value={content.introText}
            onChange={(e) => setContent({ ...content, introText: e.target.value })}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
          />
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default HomeEditor;
