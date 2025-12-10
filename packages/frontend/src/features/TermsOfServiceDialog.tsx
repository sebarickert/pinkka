import { useState } from 'react'
import type { FC } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

export const TermsOfServiceDialog: FC = () => {
  const [open, setOpen] = useState(false)

  return (
    <ResponsiveDialog
      open={open}
      setOpen={setOpen}
      title="Pinkka App Terms of Service"
      trigger={
        <button type="button" className="inline">
          Terms of Service
        </button>
      }
    >
      <p>Last updated: December 10, 2025</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By using the Pinkka app (the "App"), you agree to these Terms of Service
        ("Terms"). If you do not agree, you may not use the App.
      </p>

      <h2>2. Account Registration</h2>
      <p>
        To use the App, you must create an account using your email, Google, or
        Apple login. You are responsible for maintaining the confidentiality of
        your login information and for all activities under your account.
      </p>

      <h2>3. Use of the App</h2>
      <p>
        You agree to use the App only for lawful purposes. You may not use the
        App to:
      </p>
      <ul className="list-disc list-inside">
        <li>Violate any applicable laws or regulations</li>
        <li>Infringe the rights of others</li>
        <li>Disrupt or interfere with the App’s functionality</li>
        <li>Attempt to access other users’ accounts or private information</li>
      </ul>

      <h2>4. Privacy</h2>
      <p>
        Our <a href="/privacy-policy">Privacy Policy</a> explains how we collect
        and use your information. By using the App, you agree to our privacy
        practices.
      </p>

      <h2>5. Intellectual Property</h2>
      <p>
        The App and its content are owned by Pinkka and protected by
        intellectual property laws. You may not copy, modify, or distribute any
        part of the App without permission.
      </p>

      <h2>6. Termination</h2>
      <p>
        We may suspend or terminate your account at any time if you violate
        these Terms or engage in any harmful behavior.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        The App is provided "as is." Pinkka is not liable for any damages
        arising from your use of the App.
      </p>

      <h2>8. Changes to Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the App
        after changes constitutes your acceptance of the new Terms.
      </p>

      <h2>9. Contact Us</h2>
      <p>
        If you have any questions about these Terms, contact us at{' '}
        {/* @todo update email with correct domain */}
        <a href="mailto:support@pinkka.com">support@pinkka.com</a>.
      </p>

      <p>Thank you for using Pinkka!</p>
    </ResponsiveDialog>
  )
}
