import express, { Express } from 'express';
import { MidCloudServer } from './setupServer';
import dbConnnection from './setupDB';
import { config } from './config';

class Application {
    public init(): void {
        this.loadConfig();
        dbConnnection();
        const app: Express = express();
        const server: MidCloudServer = new MidCloudServer(app);
        server.start();
    }

    private loadConfig(): void {
        config.validateConfigs();
    }
}

const application: Application = new Application();
application.init();