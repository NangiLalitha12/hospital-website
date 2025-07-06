
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMessages, deleteMessage, updateMessage } from '@/services/firebase';
import { ContactMessage } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { MessageSquare, Trash2, Mail, Phone, User, Eye, EyeOff } from 'lucide-react';

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
    if (!confirm('Are you sure you want to delete this message?')) return;
    
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

  const handleMarkAsSeen = async (id: string, currentSeenStatus: boolean) => {
    try {
      await updateMessage(id, { seen: !currentSeenStatus });
      toast({
        title: "Success",
        description: currentSeenStatus ? "Message marked as unseen" : "Message marked as seen",
      });
      fetchMessages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive",
      });
    }
  };

  const unseenCount = messages.filter(msg => !msg.seen).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-orange-600" />
          Messages Management
        </h2>
        <div className="flex gap-4">
          <div className="bg-gradient-to-r from-red-100 to-pink-100 px-4 py-2 rounded-lg">
            <span className="text-red-800 font-medium">
              {unseenCount} Unseen Messages
            </span>
          </div>
          <div className="bg-gradient-to-r from-orange-100 to-yellow-100 px-4 py-2 rounded-lg">
            <span className="text-orange-800 font-medium">
              {messages.length} Total Messages
            </span>
          </div>
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
                  className={`${
                    message.seen 
                      ? 'bg-white hover:shadow-md' 
                      : 'bg-blue-50 border-l-4 border-l-blue-500 shadow-sm'
                  } transition-shadow border-l-4 border-l-orange-500`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span className="font-medium text-gray-800">{message.name}</span>
                            {!message.seen && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                                New
                              </span>
                            )}
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
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant={message.seen ? "outline" : "default"}
                          onClick={() => handleMarkAsSeen(message.id!, message.seen || false)}
                          title={message.seen ? "Mark as unseen" : "Mark as seen"}
                        >
                          {message.seen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(message.id!)}
                          title="Delete message"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
