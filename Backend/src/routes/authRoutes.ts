import express from "express";
import { authController } from "../controllers/authController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

// Auth routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/verify", authenticateToken, authController.verify);
router.get("/status", authController.checkStatus);

export default router;