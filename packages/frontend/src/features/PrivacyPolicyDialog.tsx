import { useState } from 'react'
import type { FC } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

export const PrivacyPolicyDialog: FC = () => {
  const [open, setOpen] = useState(false)

  return (
    <ResponsiveDialog
      open={open}
      setOpen={setOpen}
      title="Pinkka App Privacy Policy"
      trigger={
        <button type="button" className="inline">
          Privacy Policy
        </button>
      }
    >
      <p>Last updated: December 10, 2025</p>

      <h2>1. Information We Collect</h2>
      <p>When you create an account, we may collect:</p>
      <ul className="list-disc list-inside">
        <li>Your email or login provider info (Google/Apple)</li>
        <li>Basic account usage information</li>
        <li>Any data you voluntarily provide within the App</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul className="list-disc list-inside">
        <li>Provide and maintain the App</li>
        <li>Improve user experience</li>
        <li>Communicate with you (e.g., updates, support)</li>
      </ul>

      <h2>3. Sharing Your Information</h2>
      <p>
        We do not sell your personal information. We may share your data with
        trusted service providers who help operate the App (like authentication
        providers), but only to the extent necessary.
      </p>

      <h2>4. Security</h2>
      <p>
        We take reasonable measures to protect your data, but no system is
        completely secure. We cannot guarantee absolute security.
      </p>

      <h2>5. Your Choices</h2>
      <p>
        Currently, users cannot delete their accounts directly through the App.
        If you wish to delete your account, please contact our support at{' '}
        {/* @todo update email with correct domain */}
        <a href="mailto:support@pinkka.com">support@pinkka.com</a>. The admin
        can process account deletion on your behalf.
      </p>

      <h2>6. Children’s Privacy</h2>
      <p>
        The App is not intended for children under 13. We do not knowingly
        collect information from children.
      </p>

      <h2>7. Changes to this Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Continued use of
        the App constitutes acceptance of any changes.
      </p>

      <h2>8. Contact Us</h2>
      <p>
        Questions about privacy? Contact us at{' '}
        {/* @todo update email with correct domain */}
        <a href="mailto:support@pinkka.com">support@pinkka.com</a>.
      </p>
    </ResponsiveDialog>
  )
}
