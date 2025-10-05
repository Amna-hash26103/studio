'use server';

/**
 * @fileOverview A flow for sending a welcome email to new users.
 *
 * - sendWelcomeEmail - A function that generates and "sends" a welcome email.
 * - SendWelcomeEmailInput - The input type for the sendWelcomeEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SendWelcomeEmailInputSchema = z.object({
  name: z.string().describe('The name of the new user.'),
  email: z.string().email().describe('The email address of the new user.'),
});
export type SendWelcomeEmailInput = z.infer<typeof SendWelcomeEmailInputSchema>;

const welcomeEmailPrompt = ai.definePrompt({
  name: 'welcomeEmailPrompt',
  input: { schema: SendWelcomeEmailInputSchema },
  prompt: `
    You are the voice of FEMMORA, a supportive community for women.
    Generate a warm and welcoming email for a new user.

    User's Name: {{{name}}}

    The email should:
    1.  Welcome them warmly to FEMMORA.
    2.  Briefly mention the app's purpose: a space to connect, grow, and thrive.
    3.  Mention some key features like the supportive community, AI wellness assistants, and project collaboration.
    4.  End with an encouraging and friendly closing.

    Generate only the body of the email. The subject line will be "Welcome to FEMMORA, {{{name}}}!".
  `,
});

export async function sendWelcomeEmail(input: SendWelcomeEmailInput): Promise<void> {
  return sendWelcomeEmailFlow(input);
}

const sendWelcomeEmailFlow = ai.defineFlow(
  {
    name: 'sendWelcomeEmailFlow',
    inputSchema: SendWelcomeEmailInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    const { output: emailBody } = await welcomeEmailPrompt(input);

    // In a real application, you would integrate an email sending service here.
    // For example, using a service like Resend, SendGrid, or Nodemailer.
    // Since we can't do that here, we'll just log it to the console.
    console.log('--- Sending Welcome Email ---');
    console.log(`To: ${input.email}`);
    console.log(`Subject: Welcome to FEMMORA, ${input.name}!`);
    console.log('Body:');
    console.log(emailBody);
    console.log('-----------------------------');

    // Example of what an integration might look like:
    //
    // import { Resend } from 'resend';
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'FEMMORA <welcome@femmora.com>',
    //   to: input.email,
    //   subject: `Welcome to FEMMORA, ${input.name}!`,
    //   html: emailBody,
    // });
  }
);
