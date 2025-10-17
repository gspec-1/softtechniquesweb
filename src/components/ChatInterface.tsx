'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '../config/api';

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatInterface({ isOpen, onClose }: ChatInterfaceProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Array<{id: string, type: 'user' | 'assistant', content: string, isTyping?: boolean}>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Typing effect function
  const typeMessage = useCallback((messageId: string, fullText: string, speed: number = 30) => {
    let currentIndex = 0;
    const messageElement = document.getElementById(`message-${messageId}`);
    
    if (!messageElement) return;

    const typeInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        const partialText = fullText.substring(0, currentIndex);
        const formattedText = partialText
          .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #10B981; font-weight: 700;">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em style="color: #E5E7EB; font-weight: 600;">$1</em>');
        messageElement.innerHTML = formattedText;
        currentIndex++;
        scrollToBottom();
      } else {
        clearInterval(typeInterval);
        // Mark message as no longer typing
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, isTyping: false } : msg
        ));
      }
    }, speed);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add typing effect to welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeText = `**Hi! I'm Aken from Soft Techniques**

I'm your **AI Solutions Expert**! I specialize in transforming businesses with cutting-edge AI technology. From custom AI models to intelligent automation, I help companies unlock their full potential through innovative solutions.

**What I Can Help You With:**

**Custom AI Solutions** - Tailored AI models for your specific business needs
**AI Integration** - Seamless deployment and integration services  
**Project Showcase** - See our successful AI implementations
**Transparent Pricing** - Clear, upfront costs for AI development

**Ready to transform your business with AI? Let's chat!**`;

      const welcomeMessage = {
        id: 'welcome-' + Date.now(),
        type: 'assistant' as const,
        content: welcomeText,
        isTyping: true
      };

      setMessages([welcomeMessage]);
      
      setTimeout(() => {
        typeMessage(welcomeMessage.id, welcomeText, 15);
      }, 1000);
    }
  }, [isOpen, messages.length, typeMessage]);


  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: inputValue.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Hit your backend chat API
      const response = await fetch(API_ENDPOINTS.CHAT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage.content,
          session_id: `nextjs_session_${Date.now()}` // Generate session ID for Next.js frontend
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: data.response,
        isTyping: true
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Start typing effect after a short delay
      setTimeout(() => {
        typeMessage(assistantMessage.id, data.response, 25);
      }, 500);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: "Sorry, I encountered an error. Please try again or contact us directly at ask@softtechniques.com",
        isTyping: true
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Start typing effect for error message
      setTimeout(() => {
        typeMessage(errorMessage.id, errorMessage.content, 25);
      }, 500);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleScheduleClick = () => {
    router.push('/schedule');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Chat Interface */}
      <div className="fixed top-20 right-4 sm:right-8 bottom-16 z-50 w-96 sm:w-[28rem] max-h-[calc(100vh-9rem)] flex flex-col animate-in slide-in-from-right-5 duration-300">
        {/* Chat Window */}
        <div className="relative bg-gray-900 rounded-lg shadow-xl w-full h-full flex flex-col border border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 rounded-t-lg">
            <div className="flex items-center gap-3">
              <img
                src="/logo9.png"
                alt="Soft Techniques Logo"
                className="w-8 h-8 object-contain rounded-lg"
              />
              <div>
                <h3 className="font-medium text-white text-sm">Soft Techniques</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleScheduleClick}
                className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-500 text-white text-xs rounded-md hover:from-green-700 hover:to-green-600 transition-all font-medium"
              >
                Schedule Consultation
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-900">
            <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-lg ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-green-600 to-green-500 text-white'
                          : 'bg-gray-800/80 text-white border border-gray-600/30 backdrop-blur-sm'
                      }`}
                    >
                      {message.type === 'assistant' && message.isTyping ? (
                        <div className="text-sm leading-relaxed whitespace-pre-line">
                          <span id={`message-${message.id}`}></span>
                        </div>
                      ) : (
                        <div 
                          className="text-sm leading-relaxed whitespace-pre-line"
                          dangerouslySetInnerHTML={{
                            __html: message.content
                              .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #10B981; font-weight: 700;">$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em style="color: #E5E7EB; font-weight: 600;">$1</em>')
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800/80 text-white border border-gray-600/30 px-4 py-3 rounded-2xl backdrop-blur-sm shadow-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-300">Aken is typing</span>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about AI solutions..."
                className="flex-1 px-4 py-3 border border-gray-600 rounded-xl bg-gray-800/80 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 text-base transition-all duration-300 hover:border-gray-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/25 transform hover:scale-105 disabled:transform-none"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
