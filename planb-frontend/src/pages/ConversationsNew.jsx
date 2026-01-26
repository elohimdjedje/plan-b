import React, { useState } from 'react';
import { ArrowLeft, Loader2, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useConversations } from '../hooks/useConversations';
import { useMessages } from '../hooks/useMessages';
import ConversationList from '../components/messages/ConversationList';
import MessageThread from '../components/messages/MessageThread';
import MessageInput from '../components/messages/MessageInput';

const ConversationsPage = () => {
  const navigate = useNavigate();
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  
  const {
    conversations,
    loading: conversationsLoading,
    totalUnread,
    refresh: refreshConversations,
  } = useConversations();

  const {
    conversation,
    messages,
    loading: messagesLoading,
    sending,
    sendMessage,
    messagesEndRef,
  } = useMessages(selectedConversationId);

  const handleSelectConversation = (id) => {
    setSelectedConversationId(id);
  };

  const handleSendMessage = async (content) => {
    await sendMessage(content);
    // Rafraîchir la liste des conversations pour mettre à jour le dernier message
    refreshConversations();
  };

  // Vue mobile : afficher soit la liste soit le thread
  const showList = !selectedConversationId;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header global */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3 z-20">
        <button
          onClick={() => {
            if (selectedConversationId) {
              setSelectedConversationId(null);
            } else {
              navigate('/');
            }
          }}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">
            {selectedConversationId ? conversation?.otherUser.fullName : 'Messages'}
          </h1>
        </div>
        {!selectedConversationId && totalUnread > 0 && (
          <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
            {totalUnread}
          </span>
        )}
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop: Split view */}
        <div className="hidden md:flex flex-1">
          {/* Liste des conversations - 1/3 */}
          <div className="w-1/3 border-r border-gray-200 bg-white overflow-hidden">
            {conversationsLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-orange-500" size={32} />
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                selectedId={selectedConversationId}
                onSelect={handleSelectConversation}
                totalUnread={totalUnread}
              />
            )}
          </div>

          {/* Thread de messages - 2/3 */}
          <div className="flex-1 flex flex-col bg-white">
            {messagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-orange-500" size={32} />
              </div>
            ) : (
              <>
                <MessageThread
                  conversation={conversation}
                  messages={messages}
                  messagesEndRef={messagesEndRef}
                />
                {conversation && (
                  <MessageInput
                    onSend={handleSendMessage}
                    sending={sending}
                    disabled={!conversation}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile: Single view */}
        <div className="md:hidden flex-1 flex flex-col bg-white">
          {showList ? (
            /* Liste des conversations */
            conversationsLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-orange-500" size={32} />
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                selectedId={selectedConversationId}
                onSelect={handleSelectConversation}
                totalUnread={totalUnread}
              />
            )
          ) : (
            /* Thread de messages */
            messagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-orange-500" size={32} />
              </div>
            ) : (
              <>
                <MessageThread
                  conversation={conversation}
                  messages={messages}
                  messagesEndRef={messagesEndRef}
                />
                {conversation && (
                  <MessageInput
                    onSend={handleSendMessage}
                    sending={sending}
                    disabled={!conversation}
                  />
                )}
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationsPage;
