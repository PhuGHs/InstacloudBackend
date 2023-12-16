import { ILogin, IPeerUser, ISocketData } from '@user/interfaces/user.interface';
import { PeerServer } from 'peer';
import { Server, Socket } from 'socket.io';

export let socketIOUserObject: Server;

let users: string[] = [];
export const connectedUserMap: Map<string, string> = new Map();
export const connectedUserPeerMap: Map<string, string> = new Map();

export class SocketIOUserHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOUserObject = io;
  }

  public listen(): void {
    this.io.on('connect', (socket: Socket) => {
      socket.on('setup', (data: ILogin) => {
        this.addClientToServer(data.userId, socket.id);
        this.addUser(data.userId);
        this.io.emit('user online', users);
      });

      socket.on('peer connect', (data: IPeerUser) => {
        this.addPeerToServer(data.userId, data.peerId);
        for(const key of connectedUserPeerMap.keys()) {
          console.log(key, connectedUserPeerMap.get(key));
        }
      });

      socket.on('get peerId', data => {
        const userWhoAskSocketId: string = connectedUserMap.get(data.userWhoAsk) as string;
        const userToGetPeerId: string = connectedUserPeerMap.get(data.userToGet) as string;
        this.io.to(userWhoAskSocketId).emit('receive id', userToGetPeerId);
      });

      socket.on('block user', (data: ISocketData) => {
        this.io.emit('block user id', data);
      });

      socket.on('unblock user', (data: ISocketData) => {
        this.io.emit('unblock user id', data);
      });

      socket.on('disconnect', () => {
        this.removeClientFromServer(socket.id);
      });

      socket.on('peer disconnected', (id: string) => {
        console.log('hello');
        console.log(id);
        this.removePeerFromServer(id);
      });
    });
  }

  private addClientToServer(username: string, socketId: string): void {
    if (!connectedUserMap.has(username)) {
      connectedUserMap.set(username, socketId);
    }
  }

  private addPeerToServer(userId: string, peerId: string): void {
    connectedUserPeerMap.set(userId, peerId);
  }

  private removeClientFromServer(socketId: string): void {
    if (Array.from(connectedUserMap.values()).includes(socketId)) {
      const disconnectedUser: [string, string] = [...connectedUserMap].find((user: [string, string]) => {
        return user[1] === socketId;
      }) as [string, string];
      connectedUserMap.delete(disconnectedUser[0]);
      this.removeUser(disconnectedUser[0]);
      this.io.emit('user online', users);
    }
  }

  private removePeerFromServer(peerId: string): void {
    if (Array.from(connectedUserPeerMap.values()).includes(peerId)) {
      const disconnectedUser: [string, string] = [...connectedUserPeerMap].find((user: [string, string]) => {
        return user[1] === peerId;
      }) as [string, string];
      connectedUserPeerMap.delete(disconnectedUser[0]);
      this.removeUser(disconnectedUser[0]);
    }
  }

  private addUser(username: string): void {
    users.push(username);
    users = [...new Set(users)];
  }

  private removeUser(username: string): void {
    users = users.filter((user: string) => user !== username);
  }
}
