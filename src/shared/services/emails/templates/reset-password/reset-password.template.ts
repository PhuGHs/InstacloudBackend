import fs from 'fs';
import ejs from 'ejs';
import { IResetPasswordParams } from '@root/features/users/interfaces/user.interface';

class ResetPasswordTemplate {
  public passwordResetConfirmationTemplate(templateParams: IResetPasswordParams): string {
    const { username, ipaddress, email, date } = templateParams;
    return ejs.render(fs.readFileSync(__dirname + '/reset-password.template.ejs', 'utf-8'), {
      username,
      email,
      ipaddress,
      date,
      image_url: 'https://icons.veryicon.com/png/o/system/monitoring-class-icon/password-reset-2.png'
    });
  }
}

export const resetPasswordTemplate: ResetPasswordTemplate = new ResetPasswordTemplate();
