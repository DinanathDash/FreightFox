import React from 'react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

// Sample notifications data
const notifications = [
  {
    id: 1,
    title: 'New shipment created',
    message: 'Shipment #SH-1234 has been created and is awaiting processing.',
    time: '5 min ago',
    read: false,
  },
  {
    id: 2,
    title: 'Delivery completed',
    message: 'Order #OR-7890 has been successfully delivered to the customer.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 3,
    title: 'Shipment delay',
    message: 'Shipment #SH-5432 has been delayed due to weather conditions.',
    time: '1 day ago',
    read: true,
  },
  {
    id: 4,
    title: 'Payment received',
    message: 'Payment for order #OR-6125 has been received and confirmed.',
    time: '3 days ago',
    read: true,
  },
];

const NotificationsPopover = ({ onClose }) => {
  return (
    <div className="w-full max-h-[400px] overflow-y-auto p-1">
      <div className="flex items-center justify-between p-1">
        <h3 className="font-medium">Notifications</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs h-auto py-1 px-2 hover:bg-gray-100"
        >
          Mark all as read
        </Button>
      </div>
      
      <Separator className="my-2" />

      {notifications.length === 0 ? (
        <div className="py-6 text-center text-muted-foreground">
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 ${
                notification.read ? 'opacity-70' : 'bg-blue-50/50'
              }`}
              onClick={() => onClose()}
            >
              <div className="flex justify-between items-start">
                <h4 className={`text-sm font-medium ${notification.read ? '' : 'text-blue-900'}`}>
                  {notification.title}
                </h4>
                <span className="text-xs text-muted-foreground">{notification.time}</span>
              </div>
              <p className="text-xs mt-1">{notification.message}</p>
            </div>
          ))}
        </div>
      )}
      
      <Separator className="my-2" />
      
      <div className="flex justify-center mt-2">
        <Button 
          variant="ghost" 
          className="text-xs text-blue-600 font-normal w-full"
          onClick={() => onClose()}
        >
          View all notifications
        </Button>
      </div>
    </div>
  );
}

export { NotificationsPopover };
