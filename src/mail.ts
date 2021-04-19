import sendgrid from '@sendgrid/mail';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`)
});

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const mail = async (
  to: string,
  subject: string,
  text: string,
  html: string
): Promise<{ error: null | any; success: boolean }> => {
  try {
    await sendgrid.send({
      to,
      from: 'no-reply@luuk.gg',
      subject,
      text,
      html
    });
  } catch (error) {
    console.error(error);

    return {
      error: error.response,
      success: false
    };
  }

  return {
    error: null,
    success: true
  };
};

export default mail;
