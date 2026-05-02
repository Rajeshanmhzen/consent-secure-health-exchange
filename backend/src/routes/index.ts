import express from "express";

import superAdminRoutes from "./superadmin.routes";

const  routes = express.Router();
routes.use("/superadmin", superAdminRoutes);

export default routes;