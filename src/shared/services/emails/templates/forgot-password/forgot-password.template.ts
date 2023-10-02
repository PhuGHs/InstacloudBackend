import fs from 'fs';
import ejs from 'ejs';

class ForgotPasswordTemplate {
  public passwordResetTemplate(username: string, resetLink: string): string {
    return ejs.render(fs.readFileSync(__dirname + '/forgot-password.template.ejs', 'utf-8'), {
      username,
      resetLink,
      image_url: 'https://icons.veryicon.com/png/o/system/monitoring-class-icon/password-reset-2.png'
    });
  }
}

export const forgotPasswordTemplate: ForgotPasswordTemplate = new ForgotPasswordTemplate();
