import React, { useState, useEffect, useRef } from 'react';
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";

function LiveChat() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isChatActive, setIsChatActive] = useState(false);
  const [agentName, setAgentName] = useState('');
  const messagesEndRef = useRef(null);

  // Simulate a chat agent connecting
  useEffect(() => {
    if (isChatOpen && !isChatActive) {
      const names = ['Alex', 'Jamie', 'Taylor', 'Jordan', 'Morgan'];
      const randomName = names[Math.floor(Math.random() * names.length)];
      
      // Add system message that agent is connecting
      setMessages([
        {
          id: Date.now(),
          sender: 'system',
          content: 'Connecting you with an agent...',
          timestamp: new Date()
        }
      ]);
      
      // After a delay, simulate agent connecting
      setTimeout(() => {
        setAgentName(randomName);
        setIsChatActive(true);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            sender: 'system',
            content: `${randomName} has joined the chat and will assist you today.`,
            timestamp: new Date()
          }
        ]);
        
        // Simulate agent's first message
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now(),
              sender: 'agent',
              agentName: randomName,
              content: `Hi there! I'm ${randomName} from FreightFox support. How can I help you today?`,
              timestamp: new Date()
            }
          ]);
        }, 1000);
      }, 2000);
    }
  }, [isChatOpen, isChatActive]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Add user message
    const newMessage = {
      id: Date.now(),
      sender: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    // Simulate agent typing
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'typing',
          agentName: agentName,
          content: '',
          timestamp: new Date()
        }
      ]);
      
      // After a delay, simulate agent response
      setTimeout(() => {
        // First remove typing indicator
        setMessages(prev => prev.filter(msg => msg.sender !== 'typing'));
        
        // Generate agent response based on user message
        let response = '';
        const userMessageLower = newMessage.content.toLowerCase();
        
        if (userMessageLower.includes('tracking') || userMessageLower.includes('track')) {
          response = `To track your shipment, you can go to the Shipments tab and enter your tracking number. If you have the tracking number handy, I can look it up for you right now.`;
        }
        else if (userMessageLower.includes('payment') || userMessageLower.includes('refund')) {
          response = `For payment or refund questions, I'll need to check your account details. Can you please provide your order number?`;
        }
        else if (userMessageLower.includes('delivery') || userMessageLower.includes('late')) {
          response = `I understand delivery delays can be frustrating. Let me check the status for you. Do you have your shipment ID?`;
        }
        else {
          response = `Thanks for your message. I'd be happy to help you with that. Could you provide some more details so I can assist you better?`;
        }
        
        // Add agent response
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 2,
            sender: 'agent',
            agentName: agentName,
            content: response,
            timestamp: new Date()
          }
        ]);
      }, 1500);
    }, 500);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const endChat = () => {
    // Add system message that chat has ended
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'system',
        content: 'Chat session has ended. Thank you for contacting FreightFox support.',
        timestamp: new Date()
      }
    ]);
    
    // Reset chat state after a delay
    setTimeout(() => {
      setIsChatOpen(false);
      setIsChatActive(false);
      setAgentName('');
      setMessages([]);
    }, 3000);
  };

  return (
    <>
      {/* Chat button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className={`rounded-full p-4 shadow-lg flex items-center justify-center transition-colors ${
            isChatOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isChatOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 18.4301H13L8.54999 21.39C7.88999 21.83 7 21.3601 7 20.5601V18.4301C4 18.4301 2 16.4301 2 13.4301V7.42999C2 4.42999 4 2.42999 7 2.42999H17C20 2.42999 22 4.42999 22 7.42999V13.4301C22 16.4301 20 18.4301 17 18.4301Z" stroke="white" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 11.36V11.15C12 10.47 12.42 10.11 12.84 9.82001C13.25 9.54001 13.66 9.18002 13.66 8.52002C13.66 7.60002 12.92 6.85999 12 6.85999C11.08 6.85999 10.34 7.60002 10.34 8.52002" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11.9955 13.75H12.0045" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* Chat window */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 rounded-lg shadow-xl bg-white overflow-hidden flex flex-col border">
          {/* Chat header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white rounded-full p-2 mr-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
                  <path d="M17 18.4301H13L8.54999 21.39C7.88999 21.83 7 21.3601 7 20.5601V18.4301C4 18.4301 2 16.4301 2 13.4301V7.42999C2 4.42999 4 2.42999 7 2.42999H17C20 2.42999 22 4.42999 22 7.42999V13.4301C22 16.4301 20 18.4301 17 18.4301Z" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">FreightFox Support</h3>
                {isChatActive && (
                  <div className="flex items-center text-xs">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                    {agentName} is online
                  </div>
                )}
              </div>
            </div>
            <div className="flex">
              <button 
                onClick={endChat} 
                className="text-white text-sm mr-3 bg-blue-700 hover:bg-blue-800 rounded px-2 py-1"
              >
                End Chat
              </button>
              <button 
                onClick={toggleChat}
                className="text-white hover:text-blue-200"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Messages container */}
          <div className="flex-1 p-4 overflow-y-auto max-h-96 bg-gray-50">
            {messages.map(msg => (
              <div key={msg.id} className="mb-4">
                {msg.sender === 'system' ? (
                  <div className="text-center">
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {msg.content}
                    </span>
                  </div>
                ) : msg.sender === 'typing' ? (
                  <div className="flex items-start">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                      {msg.agentName.charAt(0)}
                    </div>
                    <div className="bg-gray-200 rounded-lg p-3 max-w-[80%]">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                ) : msg.sender === 'agent' ? (
                  <div className="flex items-start">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                      {msg.agentName.charAt(0)}
                    </div>
                    <div className="bg-gray-200 rounded-lg p-3 max-w-[80%]">
                      <div className="text-xs text-gray-500 mb-1">{msg.agentName} • {formatTime(msg.timestamp)}</div>
                      <div>{msg.content}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start flex-row-reverse">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center ml-2">
                      Y
                    </div>
                    <div className="bg-blue-600 text-white rounded-lg p-3 max-w-[80%]">
                      <div className="text-xs text-blue-200 mb-1 text-right">You • {formatTime(msg.timestamp)}</div>
                      <div>{msg.content}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-grow"
              />
              <Button type="submit" disabled={!message.trim()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.39999 6.32003L15.89 3.49003C19.7 2.22003 21.77 4.30003 20.51 8.11003L17.68 16.6C15.78 22.31 12.66 22.31 10.76 16.6L9.91999 14.08L7.39999 13.24C1.68999 11.34 1.68999 8.23003 7.39999 6.32003Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10.11 13.65L13.69 10.06" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
            </div>
          </form>
        </div>
      )}
      
      {/* CSS for typing indicator */}
      <style jsx="true">{`
        .typing-indicator {
          display: flex;
          align-items: center;
        }
        
        .typing-indicator span {
          height: 8px;
          width: 8px;
          margin: 0 2px;
          background-color: #888;
          border-radius: 50%;
          display: inline-block;
          opacity: 0.4;
          animation: typing 1.5s infinite;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes typing {
          0% {
            transform: translateY(0px);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-5px);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0px);
            opacity: 0.4;
          }
        }
      `}</style>
    </>
  );
}

export default LiveChat;
