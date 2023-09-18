import express, { Express } from 'express';
import { MidCloudServer } from '@root/setupServer';
import dbConnnection from '@root/setupDB';
import { config } from '@root/config';

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
