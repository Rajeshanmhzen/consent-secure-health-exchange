import express from "express";

import superAdminRoutes from "./superadmin.routes";
import tenantRoutes from "./tenant.routes";

const  routes = express.Router();
routes.use("/superadmin", superAdminRoutes);
routes.use("/tenant", tenantRoutes);

export default routes;