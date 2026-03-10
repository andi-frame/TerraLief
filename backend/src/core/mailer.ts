// mailer.ts — stub for MVP
// Email sending is not required for this MVP implementation.
// Implement with nodemailer when email features are needed.

export const mailer = {
  sendVerificationEmail: async (_to: string, _token: string): Promise<void> => {
    // TODO: implement via nodemailer when email verification is required
  },
  sendPasswordResetEmail: async (_to: string, _token: string): Promise<void> => {
    // TODO: implement via nodemailer when password reset is required
  },
}
