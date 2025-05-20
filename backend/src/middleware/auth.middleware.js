import jwt from "jsonwebtoken"
import { db } from "../libs/db.js";

export const authMiddleware = async (req, res, next) => {
    try {

        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json(
                {
                    message: "Unauthorized - No token provided"
                }
            )
        }

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET)
        } catch (error) {
            return res.status(401).json(
                {
                    message: "Unauthorized - Invalid token"
                }
            )
        }


        const user = await db.user.findUnique({
            where: {
                id: decoded.id
            },
            select: {
                id: true,
                image: true,
                name: true,
                email: true,
                role: true,
            }
        })


        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        req.user = user
        next()

    } catch (error) {
        res.status(500).json({
            error: "Error authenticating user",
            detail: error.message
        });
    }

}


export const checkAdmin = async (req, res, next) => {

    try {
       
        const isAdmin = req.user.id;

        const validateAdmin = await isAdmin.findUnique({
            where:{
                id:isAdmin,
            },
            select:{
                role:true
            }

        })

        if(!isAdmin || validateAdmin.role !== "ADMIN"){
            return res.status(401).json({
                message:"You are not authorized - Admins only"
            })
        }


        next()


   } catch (error) {

    console.log("Error checking admin role", error)
    res.status(500).json({message:"Error checking admin role"})
    }
}