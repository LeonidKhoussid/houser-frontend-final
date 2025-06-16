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
} from "lucide-react";
import { subscribeToConversation, unsubscribeFromConversation } from "../echo";

export default function Chat() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const currentChannelRef = useRef(null);

  const authToken = localStorage.getItem("auth_token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  console.log("🚀 Chat component loaded");

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // API helper
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

  // Fetch matches
  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await apiCall("/matches");
      setMatches(data);
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    try {
      const data = await apiCall(`/conversations/${conversationId}/messages`);
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch || sending) return;

    const messageContent = newMessage.trim();
    console.log(
      "📤 Sending message to conversation:",
      selectedMatch.conversation_id
    );

    setSending(true);

    try {
      const url = `/conversations/${selectedMatch.conversation_id}/messages`;
      const actualMessage = await apiCall(url, {
        method: "POST",
        body: JSON.stringify({
          content: messageContent,
        }),
      });

      console.log("📤 Message sent successfully:", actualMessage);

      // Add the message immediately to local state
      setMessages((prev) => {
        const messageExists = prev.some((m) => m.id === actualMessage.id);
        if (messageExists) return prev;
        return [...prev, actualMessage];
      });

      setNewMessage("");
    } catch (error) {
      console.error("❌ Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  // FIXED: Better channel management for real-time messages
  useEffect(() => {
    if (!selectedMatch?.conversation_id) {
      // Unsubscribe when no conversation selected
      unsubscribeFromConversation();
      return;
    }

    const conversationId = selectedMatch.conversation_id;
    console.log("🔔 Setting up real-time for conversation:", conversationId);

    const handleMessage = (data) => {
      console.log("📨 Real-time message received:", data);

      const { message } = data;

      // Only add messages from other users
      if (message.sender_id !== currentUser.id) {
        console.log("✅ Adding message from other user");

        setMessages((prevMessages) => {
          // Check if message already exists
          const messageExists = prevMessages.some((m) => m.id === message.id);
          if (messageExists) {
            console.log("⚠️ Message already exists, skipping");
            return prevMessages;
          }

          console.log("📝 Adding new message to state");
          const newMessages = [...prevMessages, message];
          setTimeout(() => scrollToBottom(), 100);
          return newMessages;
        });
      } else {
        console.log("ℹ️ Ignoring own message");
      }
    };

    // Subscribe to conversation
    const channel = subscribeToConversation(conversationId, handleMessage);
    currentChannelRef.current = channel;

    return () => {
      console.log("🧹 Cleaning up conversation subscription");
      unsubscribeFromConversation();
      currentChannelRef.current = null;
    };
  }, [selectedMatch?.conversation_id, currentUser.id]);

  // Select a match and load messages
  const selectMatch = (match) => {
    console.log("🎯 Selecting match:", match);
    setSelectedMatch(match);
    fetchMessages(match.conversation_id);
  };

  // Initial load
  useEffect(() => {
    if (authToken) {
      fetchMatches();
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
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex overflow-hidden">
      {/* Sidebar with matches */}
      <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col h-full">
        <div className="p-6 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-orange-50 to-orange-100">
          <h2 className="text-2xl font-bold text-gray-800">Your Matches</h2>
          <p className="text-sm text-gray-600 mt-2">
            {matches.length} active{" "}
            {matches.length === 1 ? "conversation" : "conversations"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {matches.length === 0 ? (
            <div className="p-8 text-center text-gray-500 h-full flex flex-col justify-center">
              <Home className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="font-semibold text-gray-700 mb-2">
                No matches yet
              </h3>
              <p className="text-sm">Like properties to start chatting!</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {matches.map((match) => {
                const otherUser = match.other_user;
                const property = match.property;
                const isSelected =
                  selectedMatch?.conversation_id === match.conversation_id;
                const unreadCount = property.messages_count || 0;

                return (
                  <div
                    key={match.conversation_id}
                    onClick={() => selectMatch(match)}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected
                        ? "bg-gradient-to-r from-orange-100 to-orange-50 border-l-4 border-orange-400 shadow-sm"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 truncate text-base">
                              {otherUser.name}
                            </h3>
                            <p className="text-sm text-gray-600 truncate font-medium">
                              {property.title}
                            </p>
                          </div>
                          {unreadCount > 0 && (
                            <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {property.city}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <DollarSign className="w-3 h-3" />${property.price}
                            /mo
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col h-full bg-white">
        {selectedMatch ? (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedMatch(null)}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {selectedMatch.other_user.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedMatch.property.title} • $
                      {selectedMatch.property.price}/mo
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => (window.location.href = "/dashboard")}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages - Scrollable area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-12">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No messages yet
                  </h3>
                  <p className="text-sm">
                    Start the conversation by saying hello!
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.sender_id === currentUser.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isOwn ? "justify-end" : "justify-start"
                      } mb-3`}>
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                          isOwn
                            ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-br-md"
                            : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                        }`}>
                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-2 ${
                            isOwn ? "text-orange-100" : "text-gray-500"
                          }`}>
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0 shadow-lg">
              <div className="flex gap-3 max-w-4xl mx-auto">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all shadow-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="p-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full hover:from-orange-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none">
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-gradient-to-b from-gray-50 to-white">
            <div className="text-center">
              <MessageCircle className="w-20 h-20 mx-auto mb-6 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Select a match to start chatting
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the sidebar to begin messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
