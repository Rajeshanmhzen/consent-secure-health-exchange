const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type ProfileFormValues = {
  name?: string
  email?: string
}

export type ProfileFormErrors = {
  name?: string
  email?: string
}

export const validateProfileForm = (values: ProfileFormValues): ProfileFormErrors => {
  const errors: ProfileFormErrors = {}

  if (!values.name || !values.name.trim()) {
    errors.name = 'Full Name is required'
  }

  if (!values.email || !values.email.trim()) {
    errors.email = 'Email is required'
  } else if (!emailRegex.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address'
  }

  return errors
}