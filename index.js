import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './src/db/index.js'
import todosRoutes from './src/routes/todos.route.js'
import usersRoutes from './src/routes/user.route.js'
import cookieParser from "cookie-parser";


dotenv.config()
const app = express()
const port = process.env.PORT

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'authorization', 'Origin', 'Accept']
}));
app.use(express.json())
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send(`Hello World! ${process.env.MONGO_URI}`)
})


// Middleware to ensure database connection is established before processing requests (critical for Vercel serverless functions)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection middleware error:", error);
    res.status(500).json({ message: "Database connection failed", error: error.message });
  }
});

// routes
app.use('/api/v1' , todosRoutes)
app.use('/api/v1' , usersRoutes)

// For local development, start the server listening
if (process.env.NODE_ENV !== 'production') {
  app.listen(port || 3000, () => {
    console.log(`⚙️  Server is running at port : ${port || 3000}`);
  });
}

export default app;