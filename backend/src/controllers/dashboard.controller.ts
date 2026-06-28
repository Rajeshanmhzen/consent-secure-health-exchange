import { Request, Response } from "express";
import prisma from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";

export class DashboardController {
    superAdminStats = asyncHandler(async (_req: Request, res: Response) => {
        const [
            totalTenants,
            totalPlans,
            totalSubscriptions,
            totalUsers,
            auditEvents,
            totalInquiries
        ] = await prisma.$transaction([
            prisma.tenant.count(),
            prisma.plan.count(),
            prisma.subscription.count(),
            prisma.user.count({ where: { deletedAt: null } }),
            prisma.auditLog.count(),
            prisma.inquiry.count()
        ]);

        return sendSuccess(res, "Dashboard stats fetched successfully", {
            totalTenants,
            totalPlans,
            totalSubscriptions,
            totalUsers,
            auditEvents,
            totalInquiries
        });
    });

    hospitalAdminStats = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;
        if (!user.tenantId) return sendSuccess(res, "Stats fetched", { 'Total Staff': 0, 'Total Patients': 0, 'Active Doctors': 0, 'Audit Events': 0 });

        const [totalStaff, totalPatients, activeDoctors, auditEvents] = await prisma.$transaction([
            prisma.user.count({ where: { tenantId: user.tenantId, deletedAt: null } }),
            prisma.patient.count(), // We just show all patients for now or ones linked to this hospital if we had a link.
            prisma.doctor.count({ where: { user: { tenantId: user.tenantId, isActive: true } } }),
            prisma.auditLog.count({ where: { user: { tenantId: user.tenantId } } })
        ]);

        return sendSuccess(res, "Stats fetched", { 
            'Total Staff': totalStaff, 
            'Total Patients': totalPatients, 
            'Active Doctors': activeDoctors, 
            'Audit Events': auditEvents 
        });
    });

    doctorStats = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;
        const doctor = await prisma.doctor.findFirst({ where: { userId: user.id } });
        if (!doctor) return sendSuccess(res, "Stats fetched", { 'Medical Records': 0, 'Pending Requests': 0, 'Shared Records': 0, 'Emergency Access': 0 });

        const [medicalRecords, pendingRequests, sharedRecords, emergencyAccess] = await prisma.$transaction([
            prisma.medicalRecord.count({ where: { doctorId: doctor.id, deletedAt: null } }),
            prisma.dataRequest.count({ where: { targetDoctorId: doctor.id, status: 'PENDING' } }),
            prisma.sharedRecord.count({ where: { request: { requestingDoctorId: doctor.id } } }),
            prisma.emergencyAccess.count({ where: { requestingDoctorId: doctor.id, isUsed: false } })
        ]);

        return sendSuccess(res, "Stats fetched", { 
            'Medical Records': medicalRecords, 
            'Pending Requests': pendingRequests, 
            'Shared Records': sharedRecords, 
            'Emergency Access': emergencyAccess 
        });
    });

    receptionistStats = asyncHandler(async (req: Request, res: Response) => {
        // Since we don't have schedule/appointments schema yet, returning dummy values or partial counts
        const [totalPatients] = await prisma.$transaction([
            prisma.patient.count()
        ]);
        return sendSuccess(res, "Stats fetched", { 
            'Total Patients': totalPatients, 
            'Scheduled Today': 0, 
            'Pending Check-in': 0,
            'New Registrations': 0
        });
    });

    patientStats = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;
        const patient = await prisma.patient.findFirst({ where: { userId: user.id } });
        if (!patient) return sendSuccess(res, "Stats fetched", { 'My Records': 0, 'Pending Consents': 0, 'Shared With': 0, 'Data Requests': 0 });

        const [myRecords, pendingConsents, sharedWith, dataRequests] = await prisma.$transaction([
            prisma.medicalRecord.count({ where: { patientId: patient.id, deletedAt: null } }),
            prisma.dataRequest.count({ where: { patientId: patient.id, status: 'PENDING' } }),
            prisma.sharedRecord.count({ where: { record: { patientId: patient.id } } }),
            prisma.dataRequest.count({ where: { patientId: patient.id } })
        ]);

        return sendSuccess(res, "Stats fetched", { 
            'My Records': myRecords, 
            'Pending Consents': pendingConsents, 
            'Shared With': sharedWith, 
            'Data Requests': dataRequests 
        });
    });

    getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;
        if (!user) {
            return sendSuccess(res, "Audit logs fetched successfully", []);
        }

        let whereClause: any = {};

        if (user.role === 'PATIENT') {
            const patient = await prisma.patient.findFirst({ where: { userId: user.id } });
            if (patient) {
                // All data requests involving this patient (both sides)
                const requests = await prisma.dataRequest.findMany({
                    where: { patientId: patient.id },
                    select: { id: true }
                });
                // All emergency accesses on this patient's records
                const emergencies = await prisma.emergencyAccess.findMany({
                    where: { patientId: patient.id },
                    select: { id: true }
                });
                const entityIds = [...requests.map(r => r.id), ...emergencies.map(e => e.id)];

                whereClause = {
                    OR: [
                        { userId: user.id },
                        { entityId: { in: entityIds } }
                    ]
                };
            }
        } else if (user.role === 'DOCTOR') {
            const doctor = await prisma.doctor.findFirst({ where: { userId: user.id } });
            if (doctor) {
                // Requests where this doctor is sender OR receiver
                const requests = await prisma.dataRequest.findMany({
                    where: { OR: [{ requestingDoctorId: doctor.id }, { targetDoctorId: doctor.id }] },
                    select: { id: true, patientId: true }
                });
                // All patients involved in this doctor's requests
                const patientIds = [...new Set(requests.map(r => r.patientId))];
                // Emergency accesses triggered BY this doctor
                const myEmergencies = await prisma.emergencyAccess.findMany({
                    where: { requestingDoctorId: doctor.id },
                    select: { id: true }
                });
                // Emergency accesses ON patients whose records this doctor manages
                const patientEmergencies = await prisma.emergencyAccess.findMany({
                    where: { patientId: { in: patientIds } },
                    select: { id: true }
                });
                const entityIds = [
                    ...requests.map(r => r.id),
                    ...myEmergencies.map(e => e.id),
                    ...patientEmergencies.map(e => e.id)
                ];

                whereClause = {
                    OR: [
                        { userId: user.id },
                        { entityId: { in: entityIds } }
                    ]
                };
            }
        } else if (user.role === 'HOSPITAL_ADMIN') {
            const adminUser = await prisma.user.findUnique({ where: { id: user.id }, include: { tenant: true } });
            if (adminUser && adminUser.tenantId) {
                // All doctors in this hospital (both sender and receiver hospital)
                const doctors = await prisma.doctor.findMany({
                    where: { hospital: { tenantId: adminUser.tenantId } },
                    select: { id: true }
                });
                const doctorIds = doctors.map(d => d.id);

                // All requests where any of this hospital's doctors is sender OR receiver
                const requests = await prisma.dataRequest.findMany({
                    where: {
                        OR: [
                            { requestingDoctorId: { in: doctorIds } },
                            { targetDoctorId: { in: doctorIds } }
                        ]
                    },
                    select: { id: true, patientId: true }
                });
                const patientIds = [...new Set(requests.map(r => r.patientId))];

                // Emergency accesses triggered by any doctor in this hospital
                const myEmergencies = await prisma.emergencyAccess.findMany({
                    where: { requestingDoctorId: { in: doctorIds } },
                    select: { id: true }
                });
                // Emergency accesses on patients managed by this hospital's doctors
                const patientEmergencies = await prisma.emergencyAccess.findMany({
                    where: { patientId: { in: patientIds } },
                    select: { id: true }
                });
                const entityIds = [
                    ...requests.map(r => r.id),
                    ...myEmergencies.map(e => e.id),
                    ...patientEmergencies.map(e => e.id)
                ];

                // Also include audit logs from all users in this hospital's tenant
                const tenantUserIds = await prisma.user.findMany({
                    where: { tenantId: adminUser.tenantId, deletedAt: null },
                    select: { id: true }
                });

                whereClause = {
                    OR: [
                        { userId: { in: tenantUserIds.map(u => u.id) } },
                        { entityId: { in: entityIds } }
                    ]
                };
            }
        }
        // SUPER_ADMIN: whereClause stays {} — sees everything

        const logs = await prisma.auditLog.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        email: true,
                        role: true,
                        superAdmin: { select: { fullName: true } },
                        patient: { select: { name: true } },
                        doctor: { select: { name: true } },
                        receptionist: { select: { name: true } }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const formattedLogs = logs.map(log => {
            let userName = 'System User';
            if (log.user.role === 'SUPER_ADMIN') userName = log.user.superAdmin?.fullName || userName;
            else if (log.user.role === 'PATIENT') userName = log.user.patient?.name || userName;
            else if (log.user.role === 'DOCTOR') userName = log.user.doctor?.name || userName;
            else if (log.user.role === 'RECEPTIONIST') userName = log.user.receptionist?.name || userName;

            let targetPatientName = '—';
            const meta = log.metadata as Record<string, any>;
            if (meta && meta.patientName) {
                targetPatientName = meta.patientName;
            } else if (meta && meta.targetPatientName) {
                targetPatientName = meta.targetPatientName;
            } else if (log.entityType === 'PATIENT') {
                targetPatientName = log.entityId || '—';
            }

            return {
                id: log.id,
                action: log.action,
                userEmail: log.user.email,
                userName,
                role: log.user.role,
                targetPatientName,
                ipAddress: log.ipAddress || '127.0.0.1',
                createdAt: log.createdAt,
                metadata: log.metadata || {}
            };
        });

        return sendSuccess(res, "Audit logs fetched successfully", formattedLogs);
    });
}
