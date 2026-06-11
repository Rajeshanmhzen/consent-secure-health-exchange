import type { TenantUserRole } from '../services/tenant.service'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /\d{6,}/

export type StaffFormValues = {
  role: TenantUserRole
  name?: string
  email?: string
  password?: string
  phone?: string
  specialty?: string
  dob?: string
  tenantId?: string | null
  hospitalId?: string | null
  isEditMode?: boolean
}

export type StaffFormErrors = {
  form?: string
  name?: string
  email?: string
  password?: string
  phone?: string
  specialty?: string
  dob?: string
}

export const validateStaffForm = (values: StaffFormValues): StaffFormErrors => {
  const errors: StaffFormErrors = {}

  if (!values.tenantId) {
    errors.form = 'Tenant context is missing. Please sign in again.'
  }

  if (
    (values.role === 'DOCTOR' || values.role === 'RECEPTIONIST') &&
    !values.hospitalId
  ) {
    errors.form = 'Hospital context is required for doctor and receptionist accounts.'
  }

  if (!values.name || !values.name.trim()) {
    errors.name = 'Full Name is required'
  }

  if (!values.email || !values.email.trim()) {
    errors.email = 'Email is required'
  } else if (!emailRegex.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address'
  }

  if (!values.isEditMode && !values.password) {
    errors.password = 'Password is required'
  } else if (values.password && values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  if (!values.phone || !values.phone.trim()) {
    errors.phone = 'Phone Number is required'
  } else if (!phoneRegex.test(values.phone)) {
    errors.phone = 'Please enter a valid phone number'
  }

  if (values.role === 'DOCTOR' && (!values.specialty || !values.specialty.trim())) {
    errors.specialty = 'Clinical Specialization is required'
  }

  if (values.role === 'PATIENT' && !values.dob) {
    errors.dob = 'Date of Birth is required'
  }

  return errors
}