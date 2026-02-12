import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, ArrowLeft, MessageCircle } from 'lucide-react';
import { chatApi } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import type { Conversation, Message } from '../types';
import { useTranslation } from '../i18n';

export default function ChatPage() {
  const { t, lang } = useTranslation();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { user } = useAuth();
  const { socket, connected } = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
      markAsRead(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    if (socket && conversationId) {
      socket.emit('join_conversation', conversationId);

      const handleNewMessage = (message: Message & { conversationId?: string }) => {
        const msgConvId = message.conversationId;
        if (msgConvId === conversationId) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
          // Mark as read since we're viewing this conversation
          markAsRead(conversationId);
        }
        // Update conversation list with new last message
        if (msgConvId) {
          setConversations(prev => prev.map(c =>
            c.id === msgConvId
              ? { ...c, lastMessage: message, updatedAt: message.createdAt }
              : c
          ));
        }
      };

      socket.on('new_message', handleNewMessage);

      return () => {
        socket.off('new_message', handleNewMessage);
        socket.emit('leave_conversation', conversationId);
      };
    }
  }, [socket, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data } = await chatApi.getConversations();
      setConversations(data.conversations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const { data } = await chatApi.getMessages(convId);
      setMessages(data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (convId: string) => {
    try {
      await chatApi.markAsRead(convId);
      // Update unread count in conversations list
      setConversations(prev => prev.map(c =>
        c.id === convId ? { ...c, unreadCount: 0 } : c
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || sending) return;

    setSending(true);
    try {
      const { data } = await chatApi.sendMessage(conversationId, newMessage.trim());
      setMessages(prev => [...prev, data.message]);
      setNewMessage('');
      // Update conversation list
      setConversations(prev => prev.map(c =>
        c.id === conversationId
          ? { ...c, lastMessage: data.message, updatedAt: data.message.createdAt }
          : c
      ));
      scrollToBottom();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const activeConversation = conversations.find(c => c.id === conversationId);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 h-[calc(100vh-140px)]">
      <div className="flex h-full gap-4">
        {/* Conversations List */}
        <div className={`w-80 flex-shrink-0 card overflow-hidden flex flex-col ${conversationId ? 'hidden md:flex' : 'flex'}`}>
          <h2 className="font-semibold p-4 border-b border-gray-200 dark:border-gray-700">
            {t.chat.conversations}
          </h2>
          {conversations.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center p-4">
              <div>
                <MessageCircle className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-gray-500 text-sm">{t.chat.noConversations}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {conversations.map(conv => {
                const other = conv.otherUser;
                const lastMsg = conv.lastMessage;
                const isActive = conv.id === conversationId;
                const hasUnread = conv.unreadCount > 0;

                return (
                  <Link
                    key={conv.id}
                    to={`/wiadomosci/${conv.id}`}
                    className={`block p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      isActive ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                        {other.avatarUrl ? (
                          <img src={other.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <span className="text-primary-600 dark:text-primary-400 font-semibold">
                            {other.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{other.name}</span>
                          {hasUnread && (
                            <span className="w-5 h-5 bg-primary-500 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{conv.listing.title}</p>
                        {lastMsg && (
                          <p className={`text-sm truncate ${hasUnread ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                            {lastMsg.senderId === user?.id ? `${t.chat.you}: ` : ''}{lastMsg.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat Window */}
        <div className={`flex-1 card overflow-hidden flex flex-col ${!conversationId ? 'hidden md:flex' : 'flex'}`}>
          {conversationId && activeConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <Link to="/wiadomosci" className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  {activeConversation.otherUser.avatarUrl ? (
                    <img src={activeConversation.otherUser.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <span className="text-primary-600 dark:text-primary-400 font-semibold">
                      {activeConversation.otherUser.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <Link to={`/uzytkownik/${activeConversation.otherUser.id}`} className="font-medium hover:text-primary-500">
                    {activeConversation.otherUser.name}
                  </Link>
                  <Link to={`/ogloszenia/${activeConversation.listing.id}`} className="text-sm text-gray-500 block hover:text-primary-500">
                    {activeConversation.listing.title}
                  </Link>
                </div>
                {!connected && (
                  <span className="text-xs text-red-500">{t.chat.offline}</span>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                        isMine
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-gray-100 dark:bg-gray-700 rounded-bl-md'
                      }`}>
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMine ? 'text-primary-200' : 'text-gray-500'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick replies */}
              {messages.length === 0 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                  {[
                    lang === 'pl' ? 'Czy przedmiot jest jeszcze dostępny?' : 'Is this still available?',
                    lang === 'pl' ? 'Jaki jest najniższy możliwy cennik?' : 'What is the lowest price?',
                    lang === 'pl' ? 'Czy możliwy jest odbiór osobisty?' : 'Is pickup possible?',
                    lang === 'pl' ? 'Czy wysyłka jest możliwa?' : 'Can you ship it?',
                  ].map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => setNewMessage(reply)}
                      className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-500 dark:hover:border-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder={t.chat.placeholder}
                    className="input-field flex-1"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="btn-primary !px-4"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <MessageCircle className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h2 className="text-xl font-semibold mb-2">{t.chat.selectConversation}</h2>
                <p className="text-gray-500">{t.chat.selectHint}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
