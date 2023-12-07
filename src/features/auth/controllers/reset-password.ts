import { authService } from '@root/shared/services/db/auth.service';
import { Request, Response } from 'express';
import crypto from 'crypto';
import { IAuthDocument } from '../interfaces/auth.interface';
import { BadRequestError } from '@root/shared/globals/helpers/error-handler';
import { config } from '@root/config';
import { forgotPasswordTemplate } from '@root/shared/services/emails/templates/forgot-password/forgot-password.template';
import { emailQueue } from '@root/shared/services/queues/email.queue';
import STATUS_CODE from 'http-status-codes';
import publicIP from 'ip';
import moment from 'moment';
import { resetPasswordTemplate } from '@root/shared/services/emails/templates/reset-password/reset-password.template';
import { IResetPasswordParams } from '@root/features/users/interfaces/user.interface';
import { joiValidation } from '@global/decorators/joi.validation';
import { emailSchema, passwordSchema } from '@auth/schemes/resetPassword.scheme';

export class Password {
  @joiValidation(emailSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const user: IAuthDocument = (await authService.getAuthUserByUsernameOrEmail('', email)) as IAuthDocument;
    if (!user) {
      throw new BadRequestError('Invalid email');
    }

    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');

    await authService.updateResetPasswordToken(`${user._id}`, randomCharacters, Date.now() * 60 * 60 * 1000);

    const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharacters}`;
    const template: string = forgotPasswordTemplate.passwordResetTemplate(user.username, resetLink);
    emailQueue.addEmailJob('resetPassword', {
      receiverEmail: user.email,
      template,
      subject: 'Reset your password'
    });
    res.status(STATUS_CODE.OK).json({ message: 'Password reset request email has been sent.' });
  }

  @joiValidation(passwordSchema)
  public async update(req: Request, res: Response): Promise<void> {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;
    if (password !== confirmPassword) {
      throw new BadRequestError('Passwords do not match');
    }
    const user: IAuthDocument = await authService.getAuthUserByPasswordToken(token);
    if (!user) {
      throw new BadRequestError('The reset password token has expired or invalid');
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    const templateParams: IResetPasswordParams = {
      username: user.username,
      email: user.email,
      ipaddress: publicIP.address(),
      date: moment().format('DD/MM/YYYY HH:mm')
    };

    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    emailQueue.addEmailJob('resetPassword', { template, receiverEmail: user.email, subject: 'Password reset confirmation' });
    res.status(STATUS_CODE.OK).json({ message: 'Password has been updated succesfully!' });
  }
}
