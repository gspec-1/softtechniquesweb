'use client';

import { usePathname } from 'next/navigation';
import ChatBotButton from './ChatBotButton';
import { useChat } from './ChatProvider';

export default function ConditionalChatButton() {
  const pathname = usePathname();
  const { isChatOpen, setChatOpen } = useChat();
  
  // Only show chat button on the main page, not on schedule page
  const showChatButton = pathname === '/';

  if (!showChatButton) {
    return null;
  }

  return <ChatBotButton isChatOpen={isChatOpen} setChatOpen={setChatOpen} />;
}

