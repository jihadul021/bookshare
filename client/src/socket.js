import { io } from 'socket.io-client';
import { getApiOrigin } from './utils/apiUrl';

let socketInstance = null;
let connectedUserId = null;

export const connectSocket = (userId) => {
  if (!userId) {
    return null;
  }

  if (!socketInstance) {
    socketInstance = io(getApiOrigin(), {
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
