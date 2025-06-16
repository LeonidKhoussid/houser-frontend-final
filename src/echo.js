import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axios from "axios";

window.Pusher = Pusher;

const authToken = localStorage.getItem("auth_token");

// FIXED: Better Echo configuration
export const echo = new Echo({
  broadcaster: "pusher",
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  forceTLS: true,
  encrypted: true,
  enabledTransports: ["ws", "wss"],
  // FIXED: Simplified authorizer
  authorizer: (channel, options) => ({
    authorize: (socketId, callback) => {
      console.log(
        "🔐 Authorizing channel:",
        channel.name,
        "with socket:",
        socketId
      );

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
          console.log("✅ Authorization successful:", response.data);
          callback(false, response.data);
        })
        .catch((error) => {
          console.error(
            "❌ Authorization failed:",
            error.response?.data || error
          );
          callback(true, error.response || error);
        });
    },
  }),
});

// Connection status logging
echo.connector.pusher.connection.bind("connected", () => {
  console.log("✅ Pusher connected successfully");
});

echo.connector.pusher.connection.bind("disconnected", () => {
  console.log("❌ Pusher disconnected");
});

echo.connector.pusher.connection.bind("error", (error) => {
  console.error("❌ Pusher connection error:", error);
});

// FIXED: Better event logging
echo.connector.pusher.bind("pusher:subscription_succeeded", (data) => {
  console.log("✅ Channel subscription succeeded:", data);
});

echo.connector.pusher.bind("pusher:subscription_error", (error) => {
  console.error("❌ Channel subscription error:", error);
});

// Initialize message handlers map
if (!window.chatMessageHandlers) {
  window.chatMessageHandlers = new Map();
  console.log("🔧 Initialized chatMessageHandlers map");
}

// FIXED: Cleaner channel subscription management
export const subscribeToConversation = (conversationId, messageHandler) => {
  const channelName = `private-conversation.${conversationId}`;
  console.log("🔔 Subscribing to channel:", channelName);

  // Leave previous channel if exists
  if (window.currentChannel) {
    echo.leave(window.currentChannel);
    console.log("🚪 Left previous channel:", window.currentChannel);
  }

  // Subscribe to new channel
  const channel = echo.private(`conversation.${conversationId}`);
  window.currentChannel = `conversation.${conversationId}`;

  channel.listen(".MessageSent", (data) => {
    console.log("📨 MessageSent event received on channel:", channelName, data);
    if (messageHandler) {
      messageHandler(data);
    }
  });

  // Also listen without the dot prefix (fallback)
  channel.listen("MessageSent", (data) => {
    console.log("📨 MessageSent event received (no dot):", data);
    if (messageHandler) {
      messageHandler(data);
    }
  });

  return channel;
};

export const unsubscribeFromConversation = () => {
  if (window.currentChannel) {
    echo.leave(window.currentChannel);
    console.log("🚪 Left channel:", window.currentChannel);
    window.currentChannel = null;
  }
};

// LEGACY: Keep these for backward compatibility
export const registerMessageHandler = (conversationId, handler) => {
  if (!window.chatMessageHandlers) {
    window.chatMessageHandlers = new Map();
  }
  console.log("🔧 Registering handler for conversation:", conversationId);
  window.chatMessageHandlers.set(conversationId, handler);
};

export const unregisterMessageHandler = (conversationId) => {
  if (window.chatMessageHandlers) {
    console.log("🔧 Unregistering handler for conversation:", conversationId);
    window.chatMessageHandlers.delete(conversationId);
  }
};
