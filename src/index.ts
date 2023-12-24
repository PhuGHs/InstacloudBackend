import express, { Express } from 'express';
import { MidCloudServer } from '@root/setupServer';
import dbConnnection from '@root/setupDB';
import { config } from '@root/config';
import Logger from 'bunyan';
const log: Logger = config.createLogger('app');

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
    config.cloudinaryConfig();
  }

  private static handleExit(): void {
    process.on('uncaughtException', (error: Error) => {
      log.error(`There was an uncaught error: ${error}`);
      Application.shutDownProperly(1);
    });

    process.on('unhandledRejection', (reason: Error) => {
      log.error(`Unhandled rejection at promise: ${reason}`);
      Application.shutDownProperly(2);
    });

    process.on('SIGTERM', () => {
      log.error('Caught SIGTERM');
      Application.shutDownProperly(2);
    });

    process.on('SIGINT', () => {
      log.error('Caught SIGINT');
      Application.shutDownProperly(2);
    });

    process.on('exit', () => {
      log.error('exiting');
    });
  }

  private static shutDownProperly(exitCode: number): void {
    Promise.resolve()
      .then(() => {
        log.info('Shutdown complete');
        process.exit(exitCode);
      })
      .catch((error) => {
        log.error(`There's an error during shutdown: ${error}`);
        process.exit(1);
      });
  }
}

const application: Application = new Application();
application.init();
