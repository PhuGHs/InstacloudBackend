import { config } from '@root/config';
import { ISignUpData } from '@root/features/auth/interfaces/auth.interface';
import Logger from 'bunyan';

const log: Logger = config.createLogger('authService');
class AuthService {
  public async saveDataToDB(document: ISignUpData): Promise<void> {
    log.info('nothin');
  }
}

export const authService: AuthService = new AuthService();
