// backend/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';

// Routes
import authRoutes from './routes/auth';
import internshipRoutes from './routes/internships';
import applicationRoutes from './routes/applications';
import interactionRoutes from './routes/interactions';
import companyProfileRoutes from './routes/company-profile';
import studentProfileRoutes from './routes/student-profile';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDatabase();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    database: 'MongoDB'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/company-profile', companyProfileRoutes);
app.use('/api/student-profile', studentProfileRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.get('*', (req, res) => {

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CURAJ Lost & Found Server APIs</title>
          <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                text-align: center;
                padding: 50px;
            }
            h1 {
                color: #333;
            }
          </style>
      </head>
      <body>
          <h1>Lost & Found CURAJ</h1>
          <p>!! This is a Landing page for Lost & Found Server !!</p>
          <a href="https://curajlf.vercel.app/">Go to Lost & Found CURAJ</a>
      </body>
      </html>
    `);
});
// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API Documentation available at http://localhost:${PORT}/api`);
  console.log(`🗄️  Database: MongoDB`);
  console.log(`🔐 Auth: Supabase JWT`);
});