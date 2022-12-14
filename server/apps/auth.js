import { Router } from "express";
import { db } from "../utils/db.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const authRouter = Router();

authRouter.post("/register",async (req,res) => {
    const user = {
        username : req.body.username,
        password : req.body.password,
        firstname : req.body.firstname,
        lastname : req.body.lastname
    }

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)

    const collection = db.collection("users");
    await collection.insertOne(user)

    return res.json({
        message : "User has been created successfully!"
    })

}) //end register api

authRouter.post("/login", async (req,res) => {
    const user = await db.collection("users").findOne({
        username : req.body.username
    })
    

    if(!user){
        return res.status(404).json({
            message : "user not found"
        })
    }

    const isValidPassword = await bcrypt.compare(req.body.password, user.password)
    // console.log(isValidPassword)

    if(!isValidPassword){
        return res.status(401).json({
            message : "password not valid"
        })
    }

    const token = jwt.sign(
        {
            id : user._id,
            firstName : user.firstName,
            lastName : user.lastName
        },
        process.env.SECRET_KEY,
        {
            expiresIn : "900000"
        }
    )

    return res.json({
        message : "login successfully",
        token
    })



})



export default authRouter;
