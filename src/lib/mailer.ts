import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  }
});

export const sendWelcomeEmail = async (to: string, nombre: string, passwordPlain: string, rol: string) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Nodemailer: Falta EMAIL_USER o EMAIL_PASS en el .env, omitiendo envío de correo.");
    return false;
  }

  const mailOptions = {
    from: `"Hotel Management System" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: `¡Bienvenido al Equipo! Tus credenciales de acceso`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #F8FAFC; padding: 40px; border-radius: 8px;">
        <div style="background: white; padding: 30px; border-radius: 8px; border: 1px solid #E2E8F0;">
          <h2 style="color: #1E293B;">¡Hola ${nombre}!</h2>
          <p style="color: #475569; font-size: 16px;">Has sido sumado exitosamente a nuestro sistema inteligente de control hotelero bajo el rol de <strong>${rol}</strong>.</p>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
          <h3 style="color: #334155;">Tus Credenciales de Acceso:</h3>
          <p><strong>Email:</strong> ${to}</p>
          <p><strong>Contraseña Temporal:</strong> <span style="background: #F1F5F9; padding: 4px 8px; border-radius: 4px;">${passwordPlain}</span></p>
          <br/>
          <p style="font-size: 14px; color: #64748B;">Recuerda no compartir estas credenciales con nadie.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error enviando email:", error);
    return false;
  }
};
