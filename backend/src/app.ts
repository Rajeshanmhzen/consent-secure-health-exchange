import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();
app.use(express.json());

const corsOptions = {
    origin : process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
}
app.use(cors(corsOptions));

app.use('/api/v1', routes);

export default app;