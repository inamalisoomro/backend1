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

app.use(cors())
app.use(express.json())
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send(`Hello World! ${process.env.MONGO_URI}`)
})


// routes
app.use('/api/v1' , todosRoutes)
app.use('/api/v1' , usersRoutes)

// Connect DB
connectDB()
  .then(() => {
    // Only start server listening if run directly (not as a Vercel serverless function)
    if (process.env.NODE_ENV !== 'production') {
      app.listen(port || 3000, () => {
        console.log(`⚙️  Server is running at port : ${port || 3000}`);
      });
    }
  })
  .catch((err) => {
    console.log("MONGO DB connection failed !!! ", err);
  });

export default app;