import { config } from '@root/config';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { userService } from '@service/db/user.service';

const log: Logger = config.createLogger('userWorker');
class UserWorker {
  async addUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;
      await userService.createUser(value);
      job.progress(100);
      done(null, value);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async updateNotiSettings(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;
      await userService.updateNotiSettings(key, value);
      job.progress(100);
      done(null, value);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async updateBackgroundInformation(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;
      await userService.updateBackgroundInfomation(key, value);
      job.progress(100);
      done(null, value);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async updateSocialLinks(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;
      await userService.updateSocialLinks(key, value);
      job.progress(100);
      done(null, value);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async updateFullname(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;
      await userService.updateFullName(key, value);
      job.progress(100);
      done(null, value);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const userWorker: UserWorker = new UserWorker();
