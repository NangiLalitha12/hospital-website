
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getHomeContent, updateHomeContent } from '@/services/firebase';
import { HomeContent } from '@/types';
import { toast } from '@/components/ui/use-toast';

const HomeEditor = () => {
  const [content, setContent] = useState<HomeContent>({
    bannerTitle: '',
    bannerSubtitle: '',
    bannerImage: '',
    welcomeMessage: '',
    introText: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      const data = await getHomeContent();
      if (data) setContent(data);
    };
    fetchContent();
  }, []);

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
    <Card>
      <CardHeader>
        <CardTitle>Edit Home Page Content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="bannerTitle">Banner Title</Label>
          <Input
            id="bannerTitle"
            value={content.bannerTitle}
            onChange={(e) => setContent({ ...content, bannerTitle: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="bannerSubtitle">Banner Subtitle</Label>
          <Input
            id="bannerSubtitle"
            value={content.bannerSubtitle}
            onChange={(e) => setContent({ ...content, bannerSubtitle: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="bannerImage">Banner Image URL</Label>
          <Input
            id="bannerImage"
            value={content.bannerImage}
            onChange={(e) => setContent({ ...content, bannerImage: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="welcomeMessage">Welcome Message</Label>
          <Textarea
            id="welcomeMessage"
            value={content.welcomeMessage}
            onChange={(e) => setContent({ ...content, welcomeMessage: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="introText">Intro Text</Label>
          <Textarea
            id="introText"
            value={content.introText}
            onChange={(e) => setContent({ ...content, introText: e.target.value })}
          />
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default HomeEditor;
