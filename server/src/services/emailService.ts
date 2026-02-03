import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_HOST) {
    console.log(`[Email skip] No SMTP configured. Would send to ${to}: ${subject}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Vipile <noreply@vipile.com>',
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Email send error:', err);
  }
}

export function newMessageEmail(to: string, senderName: string, listingTitle: string) {
  return sendEmail(
    to,
    `Nowa wiadomosc od ${senderName} - Vipile`,
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Vipile</h2>
      <p>Masz nowa wiadomosc od <strong>${senderName}</strong> w sprawie ogloszenia <strong>"${listingTitle}"</strong>.</p>
      <p><a href="${process.env.CLIENT_URL}/wiadomosci" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">Zobacz wiadomosc</a></p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px;">Ta wiadomosc zostala wyslana automatycznie. Nie odpowiadaj na tego maila.</p>
    </div>
    `
  );
}
