import express, { Express } from 'express';
import { MidCloudServer } from './setupServer';

class Application {
    public init(): void {
        const app: Express = express();
        const server: MidCloudServer = new MidCloudServer(app);
        server.start();
    }
}

const application: Application = new Application();
application.init();