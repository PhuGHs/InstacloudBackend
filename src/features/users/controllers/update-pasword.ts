import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';
import { joiValidation } from '@global/decorators/joi.validation';
import { changePasswordSchema } from '@user/schemes/user.scheme';
import { BadRequestError } from '@global/helpers/error-handler';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { authService } from '@service/db/auth.service';
import { userService } from '@service/db/user.service';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import { emailQueue } from '@service/queues/email.queue';
import publicIP from 'ip';
import { resetPasswordTemplate } from '@service/emails/templates/reset-password/reset-password.template';
import moment from 'moment';

export class Update {
  @joiValidation(changePasswordSchema)
  public async password(req: Request, res: Response): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if(newPassword !== confirmPassword) {
      throw new BadRequestError('Passwords do not match.');
    }

    const existingUser: IAuthDocument = await authService.getAuthUserByUsernameOrEmail('', req.currentUser!.email);
    const passwordsMatch: boolean = await existingUser.comparePassword(currentPassword);
    if(!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }
    const hashedPassword: string = await existingUser.hashPassword(newPassword);
    await userService.updatePassword(req.currentUser!.uId, hashedPassword);
    const templateParams: IResetPasswordParams = {
      username: existingUser.username,
      email: existingUser.email,
      ipaddress: publicIP.address(),
      date: moment().format('DD/MM/YYYY HH:mm')
    };
    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    emailQueue.addEmailJob('changePasswordEmail', { template, receiverEmail: existingUser.email!, subject: 'Password Update Confirmation'});
    res.status(STATUS_CODE.OK).json({ message: 'Password has been updated successfully. You will be redirected to the login page.'});
  }
}
