import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useToast } from '../Context/ToastContext'
import ContactForm from '../components/module/contact/ContactForm'
import { ContactSkeleton } from '../components/skeletons/PageSkeletons'
import PageWrapper from '../components/shared/PageWrapper'
import { inquiryApi, type InquiryType } from '../services/inquiry.service'

const ContactPage = () => {
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    workEmail: '',
    phoneNumber: '',
    organization: '',
    inquiryType: 'Sales / Demo',
    message: '',
  })

  const { scrollY } = useScroll()
  const scatterSlow = useTransform(scrollY, [0, 500], [0, -30])
  const scatterFast = useTransform(scrollY, [0, 500], [0, 45])
  const scatterOpp = useTransform(scrollY, [0, 500], [0, -60])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsPageLoading(false), 900)
    return () => window.clearTimeout(timeoutId)
  }, [])

  const handleChange = <K extends keyof typeof formData,>(field: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await inquiryApi.create({
        ...formData,
        inquiryType: formData.inquiryType as InquiryType,
        phoneNumber: formData.phoneNumber || undefined,
        organization: formData.organization || undefined,
      })
      showToast('Inquiry submitted successfully. We will contact you soon.', 'success')
      setFormData({
        firstName: '',
        lastName: '',
        workEmail: '',
        phoneNumber: '',
        organization: '',
        inquiryType: 'Sales / Demo',
        message: '',
      })
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to submit inquiry', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageWrapper fullHeight>
      {isPageLoading ? (
        <ContactSkeleton />
      ) : (
        <div className="relative mx-auto w-[82%] max-w-7xl px-6 py-10">
          <motion.div
            className="pointer-events-none absolute -left-8 top-32 h-16 w-16 rounded-full"
            style={{ backgroundColor: 'var(--color-primary-ghost)' }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="pointer-events-none absolute left-20 top-64 h-8 w-8 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)', opacity: 0.2 }}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="pointer-events-none absolute right-12 top-24 h-10 w-10 rounded-full"
            style={{ backgroundColor: 'var(--color-primary-ghost)' }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="pointer-events-none absolute right-32 bottom-32 h-14 w-14 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)', opacity: 0.15 }}
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div
              className="relative flex flex-col items-center lg:items-start"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <motion.div
                style={{ y: scatterSlow, backgroundColor: 'var(--color-primary-ghost)' }}
                className="pointer-events-none absolute -left-6 top-10 h-12 w-12 rounded-full"
              />
              <motion.div
                style={{ y: scatterFast, backgroundColor: 'var(--color-accent)', opacity: 0.2 }}
                className="pointer-events-none absolute left-10 top-40 h-6 w-6 rounded-full"
              />
              <motion.div
                style={{ y: scatterOpp, backgroundColor: 'var(--color-primary-light)', opacity: 0.15 }}
                className="pointer-events-none absolute left-28 top-72 h-10 w-10 rounded-full"
              />

              <div className="max-w-md text-center lg:text-left">
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                  style={{ backgroundColor: 'var(--color-primary-ghost)', color: 'var(--color-primary)' }}
                >
                  Contact Us
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
                  className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl"
                  style={{ color: 'var(--color-text)' }}
                >
                  Let&apos;s connect
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.45, ease: 'easeOut' }}
                  className="mt-4 text-base leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Ready to modernize your hospital&apos;s data exchange? Our team is here to help.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.45, ease: 'easeOut' }}
                  className="mt-10 grid gap-6"
                >
                  {[
                    { label: 'Email', value: 'hello@healthsync.com' },
                    { label: 'Phone', value: '+1 (555) 123-4567' },
                    { label: 'Office', value: '123 Innovation Dr, Tech City' },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{item.label}</p>
                      <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item.value}</p>
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>

            <div className="flex justify-center lg:justify-end">
              <motion.div
                initial={{ opacity: 0, x: 18, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full max-w-xl rounded-4xl p-6 shadow-xl md:p-8"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                <ContactForm
                  {...formData}
                  isLoading={isSubmitting}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                />
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}

export default ContactPage
