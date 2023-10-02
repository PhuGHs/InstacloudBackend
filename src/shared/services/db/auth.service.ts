import { config } from '@root/config';
import { IAuthDocument, ISignUpData } from '@root/features/auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.schema';
import Logger from 'bunyan';
import { SupportiveMethods } from '@root/shared/globals/helpers/supportive-methods';

class AuthService {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }
  public async getAuthUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      $or: [{username: SupportiveMethods.uppercaseFirstLetter(username)}, {email: SupportiveMethods.lowercase(email)}]
    };

    const user: IAuthDocument = await AuthModel.findOne(query).exec() as IAuthDocument;
    return user;
  }
  public async getAuthUserByPasswordToken(token: string): Promise<IAuthDocument> {
    const user: IAuthDocument = await AuthModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    }).exec() as IAuthDocument;
    return user;
  }

  public async updateResetPasswordToken(authId: string, token: string, tokenExpiration: number): Promise<void> {
    await AuthModel.updateOne({_id: authId }, {
      passwordResetToken: token,
      passwordResetExpires: tokenExpiration,
    });
  }
}

export const authService: AuthService = new AuthService();
