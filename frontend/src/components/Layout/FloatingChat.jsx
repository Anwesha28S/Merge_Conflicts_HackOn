import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

export default function FloatingChat() {
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show on chat or auth pages
  if (['/chat', '/login', '/register'].includes(location.pathname)) {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/chat')}
      className="fixed bottom-8 right-8 w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] transition-all duration-300 z-50 group"
      title="Chat with Aria"
    >
      <MessageSquare size={24} className="group-hover:scale-110 transition-transform duration-300" />
      {/* Subtle pulse ring */}
      <div className="absolute inset-0 rounded-full border border-gray-900 animate-ping opacity-20"></div>
    </button>
  );
}
