import express from "express";
import { loginUser , registerUser } from "../controllers/userController.js";


const userRouter=express.Router();

userRouter.post("/register",registerUser);//for user register endpoint
userRouter.post("/login",loginUser);//for user login endpoint

// ============================================================
// EXPORT ROUTER
// ============================================================
// Export userRouter so server.js can use it
// Usage in server.js: app.use('/api/user', userRouter)
// This makes all routes above available at: /api/user/register, /api/user/login
// Each route calls respective controller functions to handle logic
// Frontend calls these endpoints for user authentication
// (register new users and login existing users)
// Example: POST /api/user/register with {name, email, password} in body
// Example: POST /api/user/login with {email, password} in body
// Responses contain success status, messages, and JWT tokens on login
// which frontend uses for authenticated requests
//



export default userRouter;