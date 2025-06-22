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
      const authToken = localStorage.getItem("auth_token");
      
      if (!authToken) {
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
          callback(false, response.data);
        })
        .catch((error) => {
          callback(true, error.response || error);
        });
    },
  }),
});

if (!window.chatMessageHandlers) {
  window.chatMessageHandlers = new Map();
}

if (!window.newConversationHandlers) {
  window.newConversationHandlers = new Set();
}

export const subscribeToConversation = (conversationId, messageHandler) => {
  if (window.currentChannel) {
    echo.leave(window.currentChannel);
  }

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

export const subscribeToUserChannel = (userId, newConversationHandler, messageHandler, likeHandler) => {
  const channelName = `user.${userId}`;
  
  if (window.userChannel && window.userChannel !== channelName) {
    echo.leave(window.userChannel);
  }

  const userChannel = echo.private(channelName);
  window.userChannel = channelName;
  window.userChannelRef = userChannel;

  if (newConversationHandler) {
    userChannel.listen(".NewConversation", (data) => {
      newConversationHandler(data);
    });

    userChannel.listen("NewConversation", (data) => {
      newConversationHandler(data);
    });
  }

  if (messageHandler) {
    userChannel.listen(".MessageSent", (data) => {
      messageHandler(data);
    });

    userChannel.listen("MessageSent", (data) => {
      messageHandler(data);
    });
  }

  if (likeHandler) {
    userChannel.listen('property.liked', (data) => {
      likeHandler(data);
    });

    userChannel.listen('.property.liked', (data) => {
      likeHandler(data);
    });
  }

  return userChannel;
};

export const subscribeToLikeNotifications = (userId, likeNotificationHandler) => {
  const channelName = `user.${userId}`;
  const channel = echo.private(channelName);
  
  channel.listen('property.liked', (data) => {
    if (likeNotificationHandler) {
      likeNotificationHandler(data);
    }
  });

  channel.listen('.property.liked', (data) => {
    if (likeNotificationHandler) {
      likeNotificationHandler(data);
    }
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
