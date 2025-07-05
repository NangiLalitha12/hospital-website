
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Bot, User as UserIcon } from 'lucide-react';

interface Message {
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

const SmartChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { 
      type: 'bot', 
      message: 'Hello! I\'m your healthcare assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');

  const getSmartResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase().trim();
    
    // Greeting responses
    if (message.match(/^(hi|hello|hey|good morning|good afternoon|good evening)$/)) {
      return 'Hello! I\'m here to help you with your healthcare needs. You can ask me about:\n• Booking appointments\n• Our services\n• Doctor information\n• Emergency contacts\n\nWhat would you like to know?';
    }
    
    // Appointment related
    if (message.includes('appointment') || message.includes('book') || message.includes('schedule')) {
      return 'I can help you with appointments! You can:\n• Book a new appointment by clicking the "Book Appointment" button\n• View your existing appointments in the Patient Portal\n• Contact us at (555) 123-4567 for immediate assistance\n\nWould you like me to guide you to the booking page?';
    }
    
    // Services related
    if (message.includes('service') || message.includes('treatment') || message.includes('medical')) {
      return 'We offer comprehensive healthcare services including:\n• General Medicine\n• Specialist Consultations\n• Diagnostic Services\n• Emergency Care\n\nYou can explore all our services in the Services section. Is there a particular service you\'re looking for?';
    }
    
    // Doctor related
    if (message.includes('doctor') || message.includes('physician') || message.includes('specialist')) {
      return 'Our experienced doctors are here to help! You can:\n• View doctor profiles in the "Our Doctors" section\n• See their specialties and availability\n• Book directly with your preferred doctor\n\nWould you like to see our doctor directory?';
    }
    
    // Emergency related
    if (message.includes('emergency') || message.includes('urgent') || message.includes('help')) {
      return '🚨 For medical emergencies, please call 911 immediately.\n\nFor non-emergency urgent care:\n• Call us at (555) 123-4567\n• Visit our emergency department\n• Use our online consultation for minor issues\n\nYour health and safety are our top priority!';
    }
    
    // Contact/hours related
    if (message.includes('contact') || message.includes('phone') || message.includes('hours') || message.includes('address')) {
      return 'Here\'s how to reach us:\n📞 Phone: (555) 123-4567\n📧 Email: support@medicare.com\n🏥 Emergency: 911\n\nOur hours: Monday-Friday 8AM-6PM, Saturday 9AM-4PM\n\nIs there anything specific you\'d like to know?';
    }
    
    // Thank you responses
    if (message.includes('thank') || message.includes('thanks')) {
      return 'You\'re very welcome! I\'m always here to help with your healthcare questions. Feel free to ask me anything else about our services, appointments, or medical care. Have a great day! 😊';
    }
    
    // Default response with helpful suggestions
    return 'I\'m here to help with your healthcare needs! Here are some things I can assist you with:\n\n🏥 Book appointments\n👨‍⚕️ Find doctor information\n💊 Learn about our services\n📞 Get contact details\n🚨 Emergency information\n\nPlease let me know what you\'d like to know more about, or feel free to ask any healthcare-related question!';
  };

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      const userMessage = {
        type: 'user' as const,
        message: currentMessage,
        timestamp: new Date()
      };
      
      const botResponse = {
        type: 'bot' as const,
        message: getSmartResponse(currentMessage),
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, userMessage, botResponse]);
      setCurrentMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {!isChatOpen ? (
        <Button
          onClick={() => setIsChatOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transform hover:scale-110 transition-all duration-200 animate-pulse"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-80 h-96 shadow-2xl border-2 border-blue-100">
          <CardContent className="p-0 h-full flex flex-col">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold">Healthcare Assistant</h3>
                  <p className="text-xs opacity-90">Always here to help</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatOpen(false)}
                className="text-white hover:bg-blue-800 p-1 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg whitespace-pre-line ${
                      msg.type === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-gray-900 shadow-sm border rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {msg.type === 'bot' && <Bot className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />}
                      <span className="text-sm">{msg.message}</span>
                      {msg.type === 'user' && <UserIcon className="h-4 w-4 mt-0.5 text-blue-200 flex-shrink-0" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white rounded-b-lg">
              <div className="flex gap-2">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Ask me anything..."
                  onKeyPress={handleKeyPress}
                  className="flex-1 border-gray-200"
                />
                <Button 
                  onClick={handleSendMessage} 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 px-3"
                  disabled={!currentMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send • For emergencies call 911
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartChat;
