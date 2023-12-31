import { Application, json, urlencoded, Response, Request, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieSession from 'cookie-session';
import HTTP_STATUS from 'http-status-codes';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import 'express-async-errors';
import compression from 'compression';
import { config } from '@root/config';
import appRoutes from '@root/routes';
import { CustomError, IErrorResponse } from '@global/helpers/error-handler';
import Logger from 'bunyan';
import { SocketIOPostHandler } from '@socket/post.socket';
import { SocketIOFollowerHandler } from '@socket/follower.socket';
import { SocketIOChatHandler } from '@socket/chat.socket';
import { SocketIOImageHandler } from '@socket/image.socket';
import { SocketIOUserHandler } from '@socket/user.socket';
import { SocketIONotificationHandler } from '@socket/notification.socket';
import { ExpressPeerServer } from 'peer';
import apiStats from 'swagger-stats';

const PORT = 5000;
const log: Logger = config.createLogger('SETUP SERVER');

export class MidCloudServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routeMiddleware(this.app);
    this.apiMonitoring(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
        maxAge: 30 * 24 * 60 * 60 * 1000, // 1 month
        secure: false
      })
    );

    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  }

  private routeMiddleware(app: Application): void {
    appRoutes(app);
  }

  private apiMonitoring(app: Application): void {
    app.use(
      apiStats.getMiddleware({
        uriPath: '/api-monitoring'
      })
    );
  }

  private globalErrorHandler(app: Application): void {
    app.all('*', (req: Request, res: Response) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found.` });
    });
    app.use((error: IErrorResponse, req: Request, res: Response, next: NextFunction) => {
      log.error(error);
      if (error instanceof CustomError) {
        return res.status(error.code).json(error.serializeErrors());
      }
      next();
    });
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIO: Server = await this.createSocketIO(httpServer);
      const peerServer = ExpressPeerServer(app.listen(9000), {
        path: '/social-media'
      });

      app.use('/peerjs', peerServer);
      this.socketIOConnection(socketIO);
      this.startHttpServer(httpServer);
    } catch (error) {
      console.log(error);
    }
  }

  private startHttpServer(httpServer: http.Server): void {
    log.info(`Server has started with process ${process.pid}`);
    httpServer.listen(PORT, () => {
      log.info(`Server is currently running on port ${PORT}`);
    });
  }

  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      }
    });
    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private socketIOConnection(io: Server): void {
    const postSocketHandler: SocketIOPostHandler = new SocketIOPostHandler(io);
    const followerSocketHandler: SocketIOFollowerHandler = new SocketIOFollowerHandler(io);
    const userSocketHandler: SocketIOUserHandler = new SocketIOUserHandler(io);
    const notificationSocketHandler: SocketIONotificationHandler = new SocketIONotificationHandler();
    const imageSocketHandler: SocketIOImageHandler = new SocketIOImageHandler();
    const chatSocketHandler: SocketIOChatHandler = new SocketIOChatHandler(io);

    postSocketHandler.listen();
    followerSocketHandler.listen();
    userSocketHandler.listen();
    chatSocketHandler.listen();
    notificationSocketHandler.listen(io);
    imageSocketHandler.listen(io);
  }
}
