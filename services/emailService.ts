export interface EmailPayload {
  to: string;
  from?: string;
  subject: string;
  body: string;
}

/**
 * Simulates sending an email via a provider like SendGrid, Mailgun, or Nodemailer.
 */
export const sendEmail = async (payload: EmailPayload): Promise<boolean> => {
  // Simulate network latency
  return new Promise((resolve) => {
    setTimeout(() => {
      console.group('📧 Email Service Provider (SendGrid/Mailgun Simulation)');
      console.log(`From: ${payload.from || 'system@projectflow.ai'}`);
      console.log(`To: ${payload.to}`);
      console.log(`Subject: ${payload.subject}`);
      console.log('--- Body ---');
      console.log(payload.body);
      console.log('------------');
      console.log(`[${new Date().toLocaleTimeString()}] Status: Sent 200 OK`);
      console.groupEnd();
      resolve(true);
    }, 600);
  });
};
