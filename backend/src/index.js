import express from "express"
import dotenv from 'dotenv'
import cookieParser from "cookie-parser"

import authRoutes from "./routes/auth.routes.js"
import problemRoutes from "./routes/problem.routes.js"

dotenv.config()


const port = process.env.PORT || 8081

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

app.get('/' , (req,res)=>{
    res.send("Hello guys welcome to leetlab")
})


app.use("/api/v1/auth", authRoutes)
app.use('/api/v1/problems' , problemRoutes)


app.listen(port, ()=>{
    console.log(`Server is running on ${port}`)
})
