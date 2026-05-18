/**
 * Centralized authentication validation rules
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type LoginErrors = {
  email?: string
  password?: string
}

export const validateLogin = (email?: string, password?: string): LoginErrors => {
  const errors: LoginErrors = {}
  if (!email || !email.trim()) {
    errors.email = 'Email is required'
  } else if (!emailRegex.test(email)) {
    errors.email = 'Please enter a valid email address'
  }

  if (!password) {
    errors.password = 'Password is required'
  }
  return errors
}

export type RegisterErrors = {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export const validateRegister = (data: {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  confirmPassword?: string
}): RegisterErrors => {
  const errors: RegisterErrors = {}

  if (!data.firstName || !data.firstName.trim()) {
    errors.firstName = 'First Name is required'
  }

  if (!data.lastName || !data.lastName.trim()) {
    errors.lastName = 'Last Name is required'
  }

  if (!data.email || !data.email.trim()) {
    errors.email = 'Email is required'
  } else if (!emailRegex.test(data.email)) {
    errors.email = 'Please enter a valid email address'
  }

  if (!data.password) {
    errors.password = 'Password is required'
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Confirm Password is required'
  } else if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return errors
}

export type ResetPasswordErrors = {
  password?: string
  confirmPassword?: string
}

export const validateResetPassword = (password?: string, confirmPassword?: string): ResetPasswordErrors => {
  const errors: ResetPasswordErrors = {}
  if (!password) {
    errors.password = 'Password is required'
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm Password is required'
  } else if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return errors
}
