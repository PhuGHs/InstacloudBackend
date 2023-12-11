import { ICall, IMessageData, ISenderReceiver } from '@chat/interfaces/chat.interface';
import { Server, Socket } from 'socket.io';
import { connectedUserMap } from './user.socket';

export let chatSocketIOObject: Server;

export class SocketIOChatHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    chatSocketIOObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('join room', (users: ISenderReceiver) => {
        const { senderName, receiverName } = users;
        const senderSocketId: string = connectedUserMap.get(senderName) as string;
        const receiverSocketId: string = connectedUserMap.get(receiverName) as string;
        socket.join(senderSocketId);
        socket.join(receiverSocketId);
      });

      socket.on('call user', (data) => {
        const receiverSocketId: string = connectedUserMap.get(data.message.receiverUsername) as string;
        console.log('there is a call from ', data.message.senderUsername);
        this.io.to(receiverSocketId).emit('call user', { signal: data.signal, message: data.message});
      });

      socket.on('answer call', (data) => {
        const senderSocketId: string = connectedUserMap.get(data.message.senderUsername) as string;
        console.log('answer call from', data.message.receiverUsername);
        this.io.to(senderSocketId).emit('call accepted', data.signal);
      });
    });
  }
}
