import { io } from 'socket.io-client';

let socketInstance = null;
let connectedUserId = null;

const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    return window.location.origin;
  }

  return apiUrl.replace(/\/api\/?$/, '');
};

export const connectSocket = (userId) => {
  if (!userId) {
    return null;
  }

  if (!socketInstance) {
    socketInstance = io(getSocketUrl(), {
      autoConnect: true
    });
  }

  if (socketInstance.connected) {
    if (connectedUserId !== userId) {
      socketInstance.emit('user-join', userId);
      connectedUserId = userId;
    }
  } else {
    socketInstance.once('connect', () => {
      socketInstance.emit('user-join', userId);
      connectedUserId = userId;
    });
  }

  return socketInstance;
};

export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    connectedUserId = null;
  }
};
