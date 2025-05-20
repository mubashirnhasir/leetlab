import express from 'express'
import { authMiddleware, checkAdmin } from '../middleware/auth.middleware.js'
import { createProblem, deleteProblem, getAllProblems, getAllProblemsSolvedByUser, getSingleProblem, updateProblem } from '../controllers/problems.controller.js'


const problemRoutes = express.Router()

problemRoutes.post("/createproblem", authMiddleware , checkAdmin, createProblem)

problemRoutes.get("/getallproblems", authMiddleware, getAllProblems)

problemRoutes.get("/get-problem/:id", authMiddleware , getSingleProblem)

problemRoutes.put("/update-problem/:id", authMiddleware, checkAdmin, updateProblem)

problemRoutes.delete("/delete-problem/:id", authMiddleware, checkAdmin, deleteProblem)




problemRoutes.get("/get-solved-problem", authMiddleware, getAllProblemsSolvedByUser)

export default problemRoutes