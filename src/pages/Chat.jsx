import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Send,
  User,
  Home,
  MapPin,
  DollarSign,
  X,
  Loader2,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import {
  echo,
  subscribeToConversation,
  unsubscribeFromConversation,
  subscribeToUserChannel,
  unsubscribeFromUserChannel,
} from "../echo";
import Layout from "../components/Layout";

export default function Chat() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({}); // Track unread counts per conversation
  const [processedMessages, setProcessedMessages] = useState(new Set()); // Track processed message IDs
  const messagesEndRef = useRef(null);
  const currentChannelRef = useRef(null);

  const authToken = localStorage.getItem("auth_token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [selectedMatch?.conversation_id]);

  const apiCall = async (endpoint, options = {}) => {
    const defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${authToken}`,
    };

    const headers = { ...defaultHeaders, ...(options.headers || {}) };

    const response = await fetch(`/api${endpoint}`, {
      headers,
      ...options,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        window.location.href = "/signin";
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  };

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await apiCall("/matches");

      const sortedMatches = data.sort((a, b) => {
        const aTime = new Date(a.last_message_at || a.created_at || 0);
        const bTime = new Date(b.last_message_at || b.created_at || 0);
        return bTime - aTime;
      });

      const initialUnreadCounts = {};
      sortedMatches.forEach((match) => {
        initialUnreadCounts[match.conversation_id] = match.unread_count || 0;
      });
      setUnreadCounts(initialUnreadCounts);

      setMatches(sortedMatches);
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const data = await apiCall(`/conversations/${conversationId}/messages`);
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch || sending) return;

    const messageContent = newMessage.trim();
    setSending(true);

    try {
      const url = `/conversations/${selectedMatch.conversation_id}/messages`;
      const actualMessage = await apiCall(url, {
        method: "POST",
        body: JSON.stringify({
          content: messageContent,
        }),
      });

      setMessages((prev) => {
        const messageExists = prev.some((m) => m.id === actualMessage.id);
        if (messageExists) return prev;
        return [...prev, actualMessage];
      });

      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  // Global message listener for unread counts (messages from conversations not currently open)
  useEffect(() => {
    if (!currentUser.id) return;

    const handleGlobalMessage = (data) => {
      const { message } = data;

      if (message.sender_id === currentUser.id) return;

      if (processedMessages.has(message.id)) {
        return;
      }

      const messageConversationId = message.conversation_id;
      const currentlySelectedConversationId = selectedMatch?.conversation_id;

      if (messageConversationId !== currentlySelectedConversationId) {
        setUnreadCounts((prev) => {
          const currentCount = prev[messageConversationId] || 0;
          return {
            ...prev,
            [messageConversationId]: currentCount + 1,
          };
        });

        setProcessedMessages((prev) => new Set([...prev, message.id]));
      }

      setMatches((prevMatches) => {
        const updatedMatches = prevMatches.map((match) => {
          if (match.conversation_id === messageConversationId) {
            return {
              ...match,
              last_message_at: message.created_at,
            };
          }
          return match;
        });

        return updatedMatches.sort((a, b) => {
          const aTime = new Date(a.last_message_at || a.created_at || 0);
          const bTime = new Date(b.last_message_at || b.created_at || 0);
          return bTime - aTime;
        });
      });
    };

    const userChannel = subscribeToUserChannel(
      currentUser.id,
      handleGlobalMessage
    );

    return () => {
      if (userChannel) {
        userChannel.stopListening(".MessageSent");
        userChannel.stopListening("MessageSent");
      }
    };
  }, [selectedMatch?.conversation_id, currentUser.id, processedMessages]);
  // Real-time message handling for current conversation
  useEffect(() => {
    if (!selectedMatch?.conversation_id) {
      unsubscribeFromConversation();
      return;
    }

    const conversationId = selectedMatch.conversation_id;

    // Clear unread count when opening a conversation
    setUnreadCounts((prev) => ({
      ...prev,
      [conversationId]: 0,
    }));

    const handleMessage = (data) => {
      const { message } = data;

      // Only add messages from other users to the current conversation
      if (message.sender_id !== currentUser.id) {
        setMessages((prevMessages) => {
          // Check if message already exists
          const messageExists = prevMessages.some((m) => m.id === message.id);
          if (messageExists) {
            return prevMessages;
          }

          const newMessages = [...prevMessages, message];
          setTimeout(() => scrollToBottom(), 100);
          return newMessages;
        });

        // Update the conversation's last_message_at in the matches list
        setMatches((prevMatches) => {
          const updatedMatches = prevMatches.map((match) => {
            if (match.conversation_id === conversationId) {
              return {
                ...match,
                last_message_at: message.created_at,
              };
            }
            return match;
          });

          // Re-sort by most recent message
          return updatedMatches.sort((a, b) => {
            const aTime = new Date(a.last_message_at || a.created_at || 0);
            const bTime = new Date(b.last_message_at || b.created_at || 0);
            return bTime - aTime;
          });
        });
      } else {
        // For sent messages, also update the matches list timestamp
        setMatches((prevMatches) => {
          const updatedMatches = prevMatches.map((match) => {
            if (match.conversation_id === conversationId) {
              return {
                ...match,
                last_message_at: message.created_at,
              };
            }
            return match;
          });

          // Re-sort by most recent message
          return updatedMatches.sort((a, b) => {
            const aTime = new Date(a.last_message_at || a.created_at || 0);
            const bTime = new Date(b.last_message_at || b.created_at || 0);
            return bTime - aTime;
          });
        });
      }
    };

    // Subscribe to conversation
    const channel = subscribeToConversation(conversationId, handleMessage);
    currentChannelRef.current = channel;

    return () => {
      unsubscribeFromConversation();
      currentChannelRef.current = null;
    };
  }, [selectedMatch?.conversation_id, currentUser.id]);

  // Listen for new conversations (when someone starts a new chat)
  useEffect(() => {
    if (!currentUser.id) return;

    const handleNewConversation = (data) => {
      const newConversation = data.conversation;

      // Add the new conversation to the matches list
      setMatches((prevMatches) => {
        // Check if conversation already exists
        const exists = prevMatches.some(
          (match) => match.conversation_id === newConversation.conversation_id
        );
        if (exists) return prevMatches;

        // Add new conversation to the top and re-sort by most recent
        const updatedMatches = [newConversation, ...prevMatches];
        return updatedMatches.sort((a, b) => {
          const aTime = new Date(a.last_message_at || a.created_at || 0);
          const bTime = new Date(b.last_message_at || b.created_at || 0);
          return bTime - aTime;
        });
      });

      // Initialize unread count for new conversation
      setUnreadCounts((prev) => ({
        ...prev,
        [newConversation.conversation_id]: 1, // New conversation has 1 unread message
      }));
    };

    const handleGlobalMessage = (data) => {
      const { message } = data;

      // Only process messages from other users
      if (message.sender_id === currentUser.id) return;

      // Prevent duplicate processing of the same message
      if (processedMessages.has(message.id)) {
        return;
      }

      const messageConversationId = message.conversation_id;
      const currentlySelectedConversationId = selectedMatch?.conversation_id;

      // If the message is NOT from the currently selected conversation, increment unread count
      if (messageConversationId !== currentlySelectedConversationId) {
        setUnreadCounts((prev) => {
          const currentCount = prev[messageConversationId] || 0;
          return {
            ...prev,
            [messageConversationId]: currentCount + 1,
          };
        });

        // Mark this message as processed
        setProcessedMessages((prev) => new Set([...prev, message.id]));
      }

      // Update the conversation's last_message_at in the matches list
      setMatches((prevMatches) => {
        const updatedMatches = prevMatches.map((match) => {
          if (match.conversation_id === messageConversationId) {
            return {
              ...match,
              last_message_at: message.created_at,
            };
          }
          return match;
        });

        // Re-sort by most recent message
        return updatedMatches.sort((a, b) => {
          const aTime = new Date(a.last_message_at || a.created_at || 0);
          const bTime = new Date(b.last_message_at || b.created_at || 0);
          return bTime - aTime;
        });
      });
    };

    // Subscribe to user channel with both handlers
    const userChannel = subscribeToUserChannel(
      currentUser.id,
      handleNewConversation,
      handleGlobalMessage
    );

    return () => {
      unsubscribeFromUserChannel();
    };
  }, [selectedMatch?.conversation_id, currentUser.id, processedMessages]);

  // Select a match and load messages
  const selectMatch = (match) => {
    setSelectedMatch(match);
    fetchMessages(match.conversation_id);
  };

  // Fetch unread counts on component mount
  const fetchUnreadCounts = async () => {
    try {
      const data = await apiCall("/unread-counts");
      if (typeof data === "object" && data !== null) {
        setUnreadCounts(data);
      }
    } catch (error) {
      console.error("Failed to fetch unread counts:", error);
      setUnreadCounts({});
    }
  };

  // Initial load
  useEffect(() => {
    if (authToken) {
      fetchMatches();
      setUnreadCounts({});
    }
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            Loading your conversations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={currentUser}
      onRefresh={() => window.location.reload()}
      onLogout={() => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        window.location.href = "/signin";
      }}
      onCityChange={() => window.location.href = "/dashboard"}
      onFilterToggle={() => window.location.href = "/dashboard"}
    >
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-orange-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Loading conversations...</p>
              </div>
            </div>
          ) : matches.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">No conversations yet</h2>
                <p className="text-gray-500">
                  Start swiping on properties to match with sellers and begin conversations!
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Conversations List */}
              <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                  <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {matches.map((match) => {
                    const otherUser = match.other_user;
                    const property = match.property;
                    const isSelected =
                      selectedMatch?.conversation_id === match.conversation_id;
                    const unreadCount = unreadCounts[match.conversation_id] || 0;
                    const isTestConversation = match.conversation_id >= 99999;

                    return (
                      <div
                        key={match.conversation_id}
                        onClick={() => selectMatch(match)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          isSelected
                            ? "bg-gradient-to-r from-orange-100 to-orange-50 border-l-4 border-orange-400"
                            : isTestConversation
                            ? "bg-gradient-to-r from-blue-50 to-blue-25 border border-blue-200 opacity-75"
                            : ""
                        }`}>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                              isTestConversation
                                ? "bg-gradient-to-br from-blue-400 to-blue-500"
                                : "bg-gradient-to-br from-orange-400 to-orange-500"
                            }`}>
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-800 truncate">
                              {otherUser.name}
                              {isTestConversation && (
                                <span className="text-xs text-blue-600 ml-2">
                                  (TEST)
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {property.title}
                            </p>
                            {unreadCount > 0 && (
                              <div className="w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-medium">
                                  {unreadCount}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {selectedMatch ? (
                  <div className="flex-1 flex flex-col bg-white overflow-hidden">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <div 
                          onClick={() => window.location.href = `/user/${selectedMatch.other_user.id}`}
                          className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 
                            onClick={() => window.location.href = `/user/${selectedMatch.other_user.id}`}
                            className="font-medium text-gray-800 cursor-pointer hover:text-orange-600 transition-colors">
                            {selectedMatch.other_user.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {selectedMatch.property.title}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_id === currentUser.id
                                ? 'bg-orange-400 text-white'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender_id === currentUser.id ? 'text-orange-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                      {/* Scroll to bottom element */}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200 flex-shrink-0">
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage();
                      }} className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                          disabled={sending}
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim() || sending}
                          className="bg-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {sending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-white">
                    <div className="text-center text-gray-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4" />
                      <p>Select a conversation to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
