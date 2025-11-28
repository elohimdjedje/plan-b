import React from 'react';
import { User, Package, Phone, CheckCheck, Check } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const MessageThread = ({ conversation, messages, messagesEndRef }) => {
  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Sélectionnez une conversation pour afficher les messages</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header avec info annonce */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {conversation.otherUser.profilePicture ? (
            <img
              src={conversation.otherUser.profilePicture}
              alt={conversation.otherUser.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User size={20} className="text-gray-500" />
            </div>
          )}

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{conversation.otherUser.fullName}</h3>
              {conversation.otherUser.isPro && (
                <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded">PRO</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package size={14} />
              <p className="truncate">{conversation.listing.title}</p>
            </div>
          </div>

          {/* Téléphone */}
          <a
            href={`tel:${conversation.otherUser.phone}`}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Appeler"
          >
            <Phone size={20} className="text-orange-500" />
          </a>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Aucun message pour le moment</p>
            <p className="text-sm">Commencez la conversation !</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isFromMe = message.isFromMe;
              const showDate = index === 0 || 
                new Date(messages[index - 1].createdAt).toDateString() !== new Date(message.createdAt).toDateString();

              return (
                <div key={message.id}>
                  {/* Séparateur de date */}
                  {showDate && (
                    <div className="flex items-center justify-center my-4">
                      <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {format(new Date(message.createdAt), 'EEEE d MMMM yyyy', { locale: fr })}
                      </span>
                    </div>
                  )}

                  {/* Message */}
                  <div className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isFromMe ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isFromMe
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                      <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isFromMe ? 'justify-end' : 'justify-start'}`}>
                        <span>{format(new Date(message.createdAt), 'HH:mm')}</span>
                        {isFromMe && (
                          <>
                            {message.isRead ? (
                              <CheckCheck size={14} className="text-blue-500" />
                            ) : (
                              <Check size={14} />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageThread;
