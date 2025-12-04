import express from "express";
import { productController } from "../controllers/productController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/adminMiddleware";

const router = express.Router();

router.get("/", authenticateToken, productController.getProducts);
router.post("/", authenticateToken, requireAdmin, productController.createProduct);
router.put("/:id", authenticateToken, requireAdmin, productController.updateProduct);
router.delete("/:id", authenticateToken, requireAdmin, productController.deleteProduct);

export default router;