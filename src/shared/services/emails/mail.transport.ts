import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import Logger from 'bunyan';
import sendGridMail from '@sendgrid/mail';
import { config } from '@root/config';
import { BadRequestError } from '@root/shared/globals/helpers/error-handler';

interface IMailerOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

const log: Logger = config.createLogger('mailOptions');
sendGridMail.setApiKey(config.SENDGRID_API_KEY!);

class MailTransport {
  public async sendEmail(receiverEmail: string, subject: string, body: string): Promise<void> {
    if (config.NODE_ENV === 'development' || config.NODE_ENV === 'test') {
      this.devEmailSender(receiverEmail, subject, body);
    } else {
      this.prodEmailSender(receiverEmail, subject, body);
    }
  }
  private async devEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    log.info(config.SENDER_EMAIL);
    const transporter: Mail = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: config.SENDER_EMAIL,
        pass: config.SENDER_PASSWORD
      }
    });

    const mailOptions: IMailerOptions = {
      from: `InsideCloud App <${config.SENDER_EMAIL!}>`,
      to: receiverEmail,
      subject,
      html: body
    };

    try {
      await transporter.sendMail(mailOptions);
      log.info('Development email has been sent successfully!');
    } catch (error) {
      log.error('Error sending email', error);
      throw new BadRequestError('Error sending email');
    }
  }
  private async prodEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    const mailOptions: IMailerOptions = {
      from: `InsideCloud App <${config.SENDER_EMAIL!}>`,
      to: receiverEmail,
      subject,
      html: body
    };

    try {
      await sendGridMail.send(mailOptions);
      log.info('Production email has been sent successfully!');
    } catch (error) {
      log.error('Email sending error', error);
      throw new BadRequestError('Email sending error');
    }
  }
}

export const mailTransport: MailTransport = new MailTransport();
