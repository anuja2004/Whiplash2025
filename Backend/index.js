import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';

// Load env variables
dotenv.config();


//import Routes 
import authRoutes from './routes/auth.js'

// Initialize express
const app = express();

// Middleware
app.use(cors({
    origin: '*', // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Basic API route with content negotiation
app.use('/health', (req, res) => {
    res.format({
        'text/plain': () => res.send('Hello World in plain text'),
        'text/html': () => res.send('<h1>Hello World in HTML</h1>'),
        'application/json': () => res.json({ message: 'Hello World in JSON' }),
        default: () => res.status(406).send('Not Acceptable'),
    });
});

app.use('/api/auth',authRoutes)

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});