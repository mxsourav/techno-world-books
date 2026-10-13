/**
 * Email Compliance & Template Service
 * Compliant with the Digital Personal Data Protection (DPDP) Act 2023,
 * Consumer Protection (E-Commerce) Rules 2020, and Global Anti-Spam Standards.
 */

export const REGISTERED_PHYSICAL_ADDRESS = {
  entity: 'Techno World Books',
  street: '90/6A, Mahatma Gandhi Rd, College Street',
  city: 'Kolkata',
  state: 'West Bengal',
  pincode: '700007',
  country: 'India',
  formatted: 'Techno World Books, 90/6A, Mahatma Gandhi Rd, College Street, Kolkata, WB 700007, India',
};

/**
 * Standard Legal Footer for Promotional / Marketing Emails.
 * Required by Indian DPDP & Anti-Spam Compliance:
 * 1. 1-Click Unsubscribe mechanism.
 * 2. Mandatory physical postal address of the registered entity.
 */
export function getPromotionalEmailFooterHtml(options?: {
  unsubscribeUrl?: string;
  recipientEmail?: string;
}): string {
  const unsubUrl = options?.unsubscribeUrl || 'https://technoworldbooks.in/profile?tab=notifications&unsubscribe=true';
  const emailNotice = options?.recipientEmail
    ? `This email was sent to ${options.recipientEmail} because you opted in to newsletters and promotions from Techno World Books.`
    : 'You are receiving this promotional update because you opted into notifications from Techno World Books.';

  return `
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: #6b7280; line-height: 1.6; text-align: center;">
      <p style="margin: 0 0 8px 0;">${emailNotice}</p>
      <p style="margin: 0 0 12px 0;">
        <a href="${unsubUrl}" style="color: #07101F; font-weight: 600; text-decoration: underline; padding: 4px 8px; background-color: #f3f4f6; border-radius: 4px; display: inline-block;">
          [ Unsubscribe from Promotional Emails ]
        </a>
        <span style="color: #d1d5db; margin: 0 6px;">&bull;</span>
        <a href="https://technoworldbooks.in/privacy-policy" style="color: #4b5563; text-decoration: underline;">
          Privacy Policy
        </a>
        <span style="color: #d1d5db; margin: 0 6px;">&bull;</span>
        <a href="https://technoworldbooks.in/legal/grievance-redressal" style="color: #4b5563; text-decoration: underline;">
          Grievance Officer
        </a>
      </p>
      <p style="margin: 0; color: #9ca3af; font-size: 10px;">
        Registered Entity &amp; Physical Address: <b>${REGISTERED_PHYSICAL_ADDRESS.formatted}</b>
      </p>
    </div>
  `.trim();
}

/**
 * Text-only version of the promotional footer for plain text email dispatches.
 */
export function getPromotionalEmailFooterText(options?: { unsubscribeUrl?: string }): string {
  const unsubUrl = options?.unsubscribeUrl || 'https://technoworldbooks.in/profile?tab=notifications&unsubscribe=true';
  return `
---
To stop receiving promotional emails, click here to unsubscribe:
${unsubUrl}

Registered Entity & Physical Address:
${REGISTERED_PHYSICAL_ADDRESS.formatted}
  `.trim();
}

export const emailService = {
  REGISTERED_PHYSICAL_ADDRESS,
  getPromotionalEmailFooterHtml,
  getPromotionalEmailFooterText,
};

export default emailService;
