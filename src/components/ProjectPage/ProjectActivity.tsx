'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import MessageInput from './MessageInput';
import ActivityFeed from './MessageList';

const currentUser = {
  id: '1',
  name: 'Hitarth',
  role: 'PRINT_SHOP_EMPLOYEE',
  avatar: '/placeholder.svg?height=32&width=32',
};

const client = {
  id: '2',
  name: 'Sam',
  role: 'CLIENT',
  avatar: '/placeholder.svg?height=32&width=32',
};

const initialMessages = [
  {
    id: 1,
    sender: client,
    content:
      "Hi Hitarth, I'm interested in getting a custom banner printed for my business. Can you help me with that?",
    timestamp: '2023-06-20T10:30:00Z',
    status: 'READ',
  },
  {
    id: 2,
    sender: currentUser,
    content:
      "Hello Sam! Absolutely, I'd be happy to help you with a custom banner. Could you provide me with some details about what you're looking for? Size, design, material preferences?",
    timestamp: '2023-06-20T10:35:00Z',
    status: 'READ',
  },
  {
    id: 3,
    sender: client,
    content:
      "Great! I'm thinking of a 6ft x 3ft banner for my store front. I'd like it to be weather-resistant as it'll be outdoors. As for the design, I have a rough idea but might need some help finalizing it.",
    timestamp: '2023-06-20T10:40:00Z',
    status: 'READ',
  },
  {
    id: 4,
    sender: currentUser,
    content:
      "Perfect, thanks for the details, Sam. For outdoor use, I'd recommend our vinyl material with UV-resistant inks. It's durable and great for long-term outdoor display. Regarding the design, we offer design services if you need assistance. Would you like to schedule a design consultation?",
    timestamp: '2023-06-20T10:45:00Z',
    status: 'UNREAD',
  },
];

export default function Activity() {
  const [messages, setMessages] = useState(initialMessages);

  const handleSendMessage = async (content: string) => {
    const newMessage = {
      id: messages.length + 1,
      sender: currentUser,
      content,
      timestamp: new Date().toISOString(),
      status: 'UNREAD',
    };
    setMessages((prev) => {return [...prev, newMessage]});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Communication</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          <ActivityFeed
            activities={messages.map((message) => {return {
              id: message.id,
              actor: {
                id: message.sender.id,
                name: message.sender.name,
                avatar: message.sender.avatar,
                role: message.sender.role.toLowerCase() as 'client' | 'freelancer' | 'system',
              },
              content: message.content,
              timestamp: message.timestamp,
              activityType: 'message',
              status: message.status === 'READ' ? 'completed' : 'pending',
            }})}
          />
          <MessageInput user={currentUser} onSendMessage={handleSendMessage} />
        </div>
      </CardContent>
    </Card>
  );
}
