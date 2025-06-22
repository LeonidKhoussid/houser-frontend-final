import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axios from "axios";

window.Pusher = Pusher;

export const echo = new Echo({
  broadcaster: "pusher",
  key: "9ce5690a9e6800eb5aeb",
  cluster: "eu",
  forceTLS: true,
  encrypted: true,
  enabledTransports: ["ws", "wss"],
  authorizer: (channel, options) => ({
    authorize: (socketId, callback) => {
      // Get the current auth token dynamically
      const authToken = localStorage.getItem("auth_token");
      
      if (!authToken) {
        console.error('No auth token found for broadcasting authorization');
        callback(true, { message: 'No auth token' });
        return;
      }
      
      axios
        .post(
          "/broadcasting/auth",
          {
            socket_id: socketId,
            channel_name: channel.name,
          },
          {
            baseURL: "http://localhost:8000",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            withCredentials: false,
          }
        )
        .then((response) => {
          console.log('Echo auth request successful for channel:', channel.name);
          callback(false, response.data);
        })
        .catch((error) => {
          console.error('Echo auth request failed for channel:', channel.name, error.response?.data || error);
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

export const subscribeToLikeNotifications = (userId, likeNotificationHandler) => {
  // Check if we already have a user channel for this user
  let channel;
  const channelName = `user.${userId}`;
  
  if (window.userChannel === channelName && window.userChannelRef) {
    // Reuse existing channel
    channel = window.userChannelRef;
    console.log(`Reusing existing private channel: ${channelName}`);
    
    // Don't add duplicate listeners - return existing channel
    return channel;
  } else {
    // Create new channel
    channel = echo.private(channelName);
    window.userChannel = channelName;
    window.userChannelRef = channel;
    console.log(`Creating new private channel: ${channelName}`);
  }
  
  // Add the like notification listener (only for new channels)
  channel.listen('.property.liked', (data) => {
    console.log('Received property.liked event:', data);
    if (likeNotificationHandler) {
      likeNotificationHandler(data);
    }
  });

  // Listen to subscription status events
  channel.on('pusher:subscription_succeeded', () => {
    console.log(`Successfully subscribed to Pusher channel: ${channelName}`);
  });
  
  channel.on('pusher:subscription_error', (status) => {
    console.error(`Failed to subscribe to Pusher channel: ${channelName}`, status);
  });

  return channel;
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
