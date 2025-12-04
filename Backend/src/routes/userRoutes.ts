import express from "express";
import { userController } from "../controllers/userController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/adminMiddleware";

const router = express.Router();

// User routes
router.get("/", authenticateToken, userController.getUsers);
router.post("/", userController.createUser);
router.put("/:id", authenticateToken, requireAdmin, userController.updateUser);
router.delete("/:id", authenticateToken, requireAdmin, userController.deleteUser);

// Profile routes
router.get("/profile", authenticateToken, userController.getProfile);
router.put("/profile", authenticateToken, userController.updateProfile);
router.post("/profile/upload-picture", authenticateToken, userController.uploadProfilePicture);

// Debug route
router.get("/debug", userController.debugUsers);

export default router;