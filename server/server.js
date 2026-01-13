import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './configs/mongodb.js';
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js';
import path from "path";


dotenv.config(); // ✅ Load .env file

const app = express();

await connectDB();
await connectCloudinary();
// Middlewares
app.use(cors());
app.use(clerkMiddleware());
app.use("/uploads", express.static("uploads"));
// Routes
app.get('/', (req, res) => res.send("API Working"));
app.post('/clerk',express.json(), clerkWebhooks)
app.use('/api/client/courses', courseRouter);
app.use('/api/course', courseRouter);
app.use('/api/educator',express.json(),educatorRouter)
app.use('/api/user',express.json(),userRouter)
app.post('/stripe',express.raw({type:'application/json'}),stripeWebhooks)


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server Running at Port ${PORT}`);
});
