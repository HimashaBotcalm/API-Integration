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

export default router;