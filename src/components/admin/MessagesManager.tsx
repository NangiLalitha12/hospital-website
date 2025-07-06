
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMessages, deleteMessage } from '@/services/firebase';
import { ContactMessage } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { MessageSquare, Trash2, Mail, Phone, User } from 'lucide-react';

const MessagesManager = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await getMessages();
      setMessages(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMessage(id);
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
      fetchMessages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-orange-600" />
          Messages Management
        </h2>
        <div className="bg-gradient-to-r from-orange-100 to-yellow-100 px-4 py-2 rounded-lg">
          <span className="text-orange-800 font-medium">
            {messages.length} Total Messages
          </span>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-t-lg">
          <CardTitle>Contact Messages</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No messages found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <Card
                  key={message.id}
                  className="bg-white hover:shadow-md transition-shadow border-l-4 border-l-orange-500"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span className="font-medium text-gray-800">{message.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span>{message.email}</span>
                          </div>
                          {message.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              <span>{message.phone}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-800">{message.message}</p>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Received on: {format(message.createdAt, 'PPP p')}
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(message.id!)}
                        className="ml-4"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagesManager;
