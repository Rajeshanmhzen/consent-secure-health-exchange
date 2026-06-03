import InputField from '../../shared/InputField'
import Button from '../../shared/Button'
import { Link } from 'react-router-dom'

type ContactFormData = {
  firstName: string
  lastName: string
  workEmail: string
  phoneNumber: string
  organization: string
  inquiryType: string
  message: string
}

interface ContactFormProps extends ContactFormData {
  onChange: <K extends keyof ContactFormData>(field: K, value: ContactFormData[K]) => void
  onSubmit?: () => void
  isLoading?: boolean
}

const ContactForm = ({
  firstName,
  lastName,
  workEmail,
  phoneNumber,
  organization,
  inquiryType,
  message,
  onChange,
  onSubmit,
  isLoading,
}: ContactFormProps) => {
  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit?.()
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="First Name"
          name="contact-first-name"
          value={firstName}
          onChange={(value) => onChange('firstName', value)}
        />
        <InputField
          label="Last Name"
          name="contact-last-name"
          value={lastName}
          onChange={(value) => onChange('lastName', value)}
        />
      </div>

      <InputField
        label="Work Email"
        name="contact-work-email"
        type="email"
        value={workEmail}
        onChange={(value) => onChange('workEmail', value)}
      />

      <InputField
        label="Phone Number"
        name="contact-phone-number"
        type="tel"
        value={phoneNumber}
        onChange={(value) => onChange('phoneNumber', value)}
      />

      <InputField
        label="Hospital / Organization"
        name="contact-organization"
        value={organization}
        onChange={(value) => onChange('organization', value)}
      />

      <InputField
        label="Inquiry Type"
        name="contact-inquiry-type"
        as="select"
        value={inquiryType}
        onChange={(value) => onChange('inquiryType', value)}
        options={[
          { label: 'Sales / Demo', value: 'Sales / Demo' },
          { label: 'Implementation Support', value: 'Implementation Support' },
          { label: 'Partnership', value: 'Partnership' },
          { label: 'General Question', value: 'General Question' },
        ]}
      />

      <InputField
        label="Message"
        name="contact-message"
        as="textarea"
        rows={5}
        value={message}
        onChange={(value) => onChange('message', value)}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isLoading}
        className="mt-2 w-full rounded-xl"
      >
        {isLoading ? 'Sending...' : 'Send Message'}
      </Button>

      <p className="text-center text-[11px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        By submitting this form, you agree to our{' '}
        <Link to="/privacy-policy" className="font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
          Privacy Policy
        </Link>{' '}
        and{' '}
        <Link to="/terms-of-service" className="font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
          Terms of Service
        </Link>.
      </p>
    </form>
  )
}

export default ContactForm
