import express from 'express';
import cors from 'cors';
import path from 'path';
import { baseUploadPath } from './middleware/fileUpload';
import routes from './routes';
import { trackApiPerformance } from './utils/apiPerformance';

const app = express();

const corsOptions = {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
}

app.use(cors(corsOptions));
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use("/uploads/profile-images", express.static(path.join(baseUploadPath, "profile-images")));
app.use('/api/v1', trackApiPerformance);
app.use('/api/v1', routes);

export default app;
