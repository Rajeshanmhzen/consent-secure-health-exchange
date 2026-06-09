import express from 'express';
import cors from 'cors';
import { baseUploadPath } from './middleware/fileUpload';
import routes from './routes';

const app = express();

const corsOptions = {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
}

app.use(cors(corsOptions));
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use("/uploads", express.static(baseUploadPath));

app.use('/api/v1', routes);

export default app;
