/**
 * Centralized Tenant and Hospital validation rules
 */

import { type AddTenantPayload } from '../services/tenant.service'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type AddTenantErrors = {
    tenantName?: string
    hospitalName?: string
    hospitalEmail?: string
    adminEmail?: string
    adminPassword?: string
    adminPhone?: string
}

export const validateAddTenant = (values: AddTenantPayload): AddTenantErrors => {
    const errors: AddTenantErrors = {}

    if (!values.tenantName || !values.tenantName.trim()) {
        errors.tenantName = 'Tenant Name is required'
    }
    if (!values.hospitalName || !values.hospitalName.trim()) {
        errors.hospitalName = 'Hospital Name is required'
    }

    if (!values.hospitalEmail || !values.hospitalEmail.trim()) {
        errors.hospitalEmail = 'Hospital Email is required'
    } else if (!emailRegex.test(values.hospitalEmail)) {
        errors.hospitalEmail = 'Please enter a valid Hospital Email'
    }

    if (!values.adminEmail || !values.adminEmail.trim()) {
        errors.adminEmail = 'Admin Email is required'
    } else if (!emailRegex.test(values.adminEmail)) {
        errors.adminEmail = 'Please enter a valid Admin Email'
    }

    if (!values.adminPassword) {
        errors.adminPassword = 'Admin Password is required'
    } else if (values.adminPassword.length < 6) {
        errors.adminPassword = 'Admin Password must be at least 6 characters'
    }

    if (!values.adminPhone || !values.adminPhone.trim()) {
        errors.adminPhone = 'Admin Phone number is required'
    }

    return errors
}
