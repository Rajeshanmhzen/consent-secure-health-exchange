import express from "express";

import superAdminRoutes from "./superadmin.routes";
import tenantRoutes from "./tenant.routes";
import authRoutes from "./auth.routes";
import pricingRoutes from "./pricing.routes";
import userRoutes from "./user.routes";
import inquiryRoutes from "./inquiry.routes";
import dashboardRoutes from "./dashboard.routes";
import requestRoutes from "./request.routes";
import emergencyRoutes from "./emergency.routes";

const routes = express.Router();
routes.use("/auth", authRoutes);
routes.use("/superadmin", superAdminRoutes);
routes.use("/tenant", tenantRoutes);
routes.use("/pricing", pricingRoutes);
routes.use("/users", userRoutes);
routes.use("/inquiries", inquiryRoutes);
routes.use("/dashboard", dashboardRoutes);
routes.use("/requests", requestRoutes);
routes.use("/emergency", emergencyRoutes);

export default routes;
