'use server';

/**
 * @fileOverview A flow for sending a welcome email to new users.
 *
 * - sendWelcomeEmail - A function that generates and "sends" a welcome email.
 * - SendWelcomeEmailInput - The input type for the sendWelcomeeEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Resend } from 'resend';

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

    Generate only the body of the email, formatted as simple HTML. The subject line will be "Welcome to FEMMORA, {{{name}}}!".
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
    const { text: emailBody } = await welcomeEmailPrompt(input);
    
    if (!process.env.RESEND_API_KEY) {
      console.log('--- RESEND_API_KEY not found. Skipping email send. ---');
      console.log('--- Email Body ---');
      console.log(emailBody);
      console.log('--------------------');
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    try {
      console.log(`Attempting to send email to ${input.email}...`);
      const { data, error } = await resend.emails.send({
        from: 'FEMMORA <onboarding@resend.dev>', // You will need to verify a domain with Resend to use a custom from address
        to: input.email,
        subject: `Welcome to FEMMORA, ${input.name}!`,
        html: emailBody,
      });

      if (error) {
        console.error('Resend API Error:', error);
        throw new Error(`Resend failed: ${error.message}`);
      }

      console.log('Resend API Success:', data);
      console.log(`Welcome email successfully sent to ${input.email}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Re-throw the error so it can be caught by the calling function
      // and displayed to the user.
      throw error;
    }
  }
);
