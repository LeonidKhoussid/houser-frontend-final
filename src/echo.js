import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axios from "axios";

window.Pusher = Pusher;

const authToken = localStorage.getItem("auth_token");

export const echo = new Echo({
  broadcaster: "pusher",
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  forceTLS: true,
  encrypted: true,
  enabledTransports: ["ws", "wss"],
  authorizer: (channel, options) => ({
    authorize: (socketId, callback) => {
      axios
        .post(
          "/broadcasting/auth",
          {
            socket_id: socketId,
            channel_name: channel.name,
          },
          {
            baseURL: import.meta.env.VITE_API_BASE_URL,
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            withCredentials: false,
          }
        )
        .then((response) => {
          callback(false, response.data);
        })
        .catch((error) => {
          callback(true, error.response || error);
        });
    },
  }),
});

// Initialize message handlers map
if (!window.chatMessageHandlers) {
  window.chatMessageHandlers = new Map();
}

// Initialize new conversation handlers
if (!window.newConversationHandlers) {
  window.newConversationHandlers = new Set();
}

export const subscribeToConversation = (conversationId, messageHandler) => {
  const channelName = `private-conversation.${conversationId}`;

  // Leave previous channel if exists
  if (window.currentChannel) {
    echo.leave(window.currentChannel);
  }

  // Subscribe to new channel
  const channel = echo.private(`conversation.${conversationId}`);
  window.currentChannel = `conversation.${conversationId}`;

  channel.listen(".MessageSent", (data) => {
    if (messageHandler) {
      messageHandler(data);
    }
  });

  channel.listen("MessageSent", (data) => {
    if (messageHandler) {
      messageHandler(data);
    }
  });

  return channel;
};

export const subscribeToUserChannel = (userId, newConversationHandler) => {
  // Prevent multiple subscriptions to the same user channel
  if (window.userChannel) {
    echo.leave(window.userChannel);
  }

  const userChannel = echo.private(`user.${userId}`);
  window.userChannel = `user.${userId}`;

  // Store the channel reference for cleanup
  window.userChannelRef = userChannel;

  if (newConversationHandler) {
    userChannel.listen(".NewConversation", (data) => {
      newConversationHandler(data);
    });

    userChannel.listen("NewConversation", (data) => {
      newConversationHandler(data);
    });
  }

  return userChannel;
};

export const unsubscribeFromConversation = () => {
  if (window.currentChannel) {
    echo.leave(window.currentChannel);
    window.currentChannel = null;
  }
};

export const unsubscribeFromUserChannel = () => {
  if (window.userChannel) {
    echo.leave(window.userChannel);
    window.userChannel = null;
    window.userChannelRef = null;
  }
};

// LEGACY: Keep these for backward compatibility
export const registerMessageHandler = (conversationId, handler) => {
  if (!window.chatMessageHandlers) {
    window.chatMessageHandlers = new Map();
  }
  window.chatMessageHandlers.set(conversationId, handler);
};

export const unregisterMessageHandler = (conversationId) => {
  if (window.chatMessageHandlers) {
    window.chatMessageHandlers.delete(conversationId);
  }
};
