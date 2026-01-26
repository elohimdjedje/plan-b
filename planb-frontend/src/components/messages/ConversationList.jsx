import React from 'react';
import { MessageCircle, User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const ConversationList = ({ conversations, selectedId, onSelect, totalUnread }) => {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <MessageCircle size={64} className="mb-4 opacity-30" />
        <p className="text-lg font-medium">Aucune conversation</p>
        <p className="text-sm">Contactez un vendeur pour démarrer une conversation</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Messages</h2>
          {totalUnread > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {totalUnread}
            </span>
          )}
        </div>
      </div>

      {/* Liste des conversations */}
      <div className="divide-y divide-gray-200">
        {conversations.map((conv) => {
          const isSelected = conv.id === selectedId;
          const hasUnread = conv.unreadCount > 0;

          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                isSelected ? 'bg-orange-50 border-l-4 border-orange-500' : ''
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {conv.otherUser.profilePicture ? (
                  <img
                    src={conv.otherUser.profilePicture}
                    alt={conv.otherUser.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User size={24} className="text-gray-500" />
                  </div>
                )}
                {conv.otherUser.isPro && (
                  <div className="absolute -mt-3 ml-8 bg-orange-500 text-white text-xs px-1 rounded">
                    PRO
                  </div>
                )}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0 text-left">
                {/* Nom et heure */}
                <div className="flex items-center justify-between mb-1">
                  <p className={`font-semibold truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                    {conv.otherUser.fullName}
                  </p>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    <Clock size={12} className="inline mr-1" />
                    {formatDistanceToNow(new Date(conv.lastMessageAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                </div>

                {/* Titre de l'annonce */}
                <p className="text-sm text-gray-600 truncate mb-1">
                  {conv.listing.title}
                </p>

                {/* Dernier message */}
                {conv.lastMessage && (
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${hasUnread ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                      {conv.lastMessage.isFromMe && 'Vous: '}
                      {conv.lastMessage.content}
                    </p>
                    {hasUnread && (
                      <span className="flex-shrink-0 ml-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationList;
