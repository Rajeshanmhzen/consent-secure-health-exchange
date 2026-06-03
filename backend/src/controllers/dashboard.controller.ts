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

    getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;
        if (!user) {
            return sendSuccess(res, "Audit logs fetched successfully", []);
        }

        let whereClause: any = {};

        if (user.role === 'PATIENT') {
            const patient = await prisma.patient.findFirst({ where: { userId: user.id } });
            if (patient) {
                const requests = await prisma.dataRequest.findMany({ where: { patientId: patient.id }, select: { id: true } });
                const emergencies = await prisma.emergencyAccess.findMany({ where: { patientId: patient.id }, select: { id: true } });
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
                const requests = await prisma.dataRequest.findMany({ 
                    where: { OR: [{ requestingDoctorId: doctor.id }, { targetDoctorId: doctor.id }] }, 
                    select: { id: true } 
                });
                const emergencies = await prisma.emergencyAccess.findMany({ 
                    where: { requestingDoctorId: doctor.id }, 
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
        } else if (user.role === 'HOSPITAL_ADMIN') {
            const adminUser = await prisma.user.findUnique({ where: { id: user.id }, include: { tenant: true } });
            if (adminUser && adminUser.tenantId) {
                const doctors = await prisma.doctor.findMany({ where: { hospital: { tenantId: adminUser.tenantId } }, select: { id: true } });
                const doctorIds = doctors.map(d => d.id);
                
                const requests = await prisma.dataRequest.findMany({ 
                    where: { OR: [{ requestingDoctorId: { in: doctorIds } }, { targetDoctorId: { in: doctorIds } }] }, 
                    select: { id: true } 
                });
                const emergencies = await prisma.emergencyAccess.findMany({ 
                    where: { requestingDoctorId: { in: doctorIds } }, 
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
        }

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
