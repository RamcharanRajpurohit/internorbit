import nodemailer from 'nodemailer';

interface EmailPayload {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  /**
   * Notify student when company views their resume
   */
  async notifyResumeViewed(
    studentEmail: string,
    studentName: string,
    companyName: string,
    resumeFile: string
  ) {
    const subject = `📄 ${companyName} viewed your resume`;
    const html = `
      <h2>Resume Viewed</h2>
      <p>Hi ${studentName},</p>
      <p><strong>${companyName}</strong> just viewed your resume <strong>"${resumeFile}"</strong></p>
      <p>Check your resume analytics to see more details.</p>
      <a href="${process.env.FRONTEND_URL}/resume-stats">View Analytics</a>
    `;

    return this.send({ to: studentEmail, subject, template: 'resume-viewed', data: {} });
  }

  /**
   * Notify student when company downloads their resume
   */
  async notifyResumeDownloaded(
    studentEmail: string,
    studentName: string,
    companyName: string
  ) {
    const subject = `📥 ${companyName} downloaded your resume`;
    const html = `
      <h2>Resume Downloaded</h2>
      <p>Hi ${studentName},</p>
      <p><strong>${companyName}</strong> downloaded your resume. They're interested!</p>
      <a href="${process.env.FRONTEND_URL}/applications">View Applications</a>
    `;

    return this.send({ to: studentEmail, subject, template: 'resume-downloaded', data: {} });
  }

  /**
   * Notify student when resume scan completes
   */
  async notifyResumeScanComplete(
    studentEmail: string,
    studentName: string,
    fileName: string,
    status: 'clean' | 'rejected',
    message?: string
  ) {
    const subject =
      status === 'clean'
        ? `✅ ${fileName} scan complete`
        : `⚠️ ${fileName} failed security scan`;

    const html =
      status === 'clean'
        ? `
        <h2>Resume Verified ✅</h2>
        <p>Hi ${studentName},</p>
        <p>Your resume <strong>"${fileName}"</strong> passed malware scanning.</p>
        <p>You can now use it in applications or share with companies.</p>
      `
        : `
        <h2>Resume Rejected ⚠️</h2>
        <p>Hi ${studentName},</p>
        <p>Your resume <strong>"${fileName}"</strong> failed security scan: ${message}</p>
        <p>Please upload a different file.</p>
      `;

    return this.send({
      to: studentEmail,
      subject,
      template: 'resume-scan',
      data: {},
    });
  }

  private async send(payload: EmailPayload) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: payload.to,
        subject: payload.subject,
        html: payload.template, // Simplified for example
      });
    } catch (error) {
      console.error('Email send error:', error);
    }
  }
}

export const emailService = new EmailService();