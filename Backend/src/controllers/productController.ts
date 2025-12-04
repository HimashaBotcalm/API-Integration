import { Response } from "express";
import Product from "../models/Product";
import { AuthRequest } from "../middleware/authMiddleware";
import { uploadToCloudinary } from "../utils/cloudinary";

export const productController = {
  async getProducts(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      
      const products = await Product.find({ isActive: true })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      
      const total = await Product.countDocuments({ isActive: true });
      
      res.json({
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createProduct(req: AuthRequest, res: Response) {
    try {
      
      const productData = { ...req.body };
      
      if (!productData.name || productData.name.trim().length < 2) {
        return res.status(400).json({ error: 'Product name is required and must be at least 2 characters' });
      }
      
      if (productData.price === undefined || isNaN(Number(productData.price)) || Number(productData.price) < 0) {
        return res.status(400).json({ error: 'Valid price is required and must be positive' });
      }
      
      if (productData.stock === undefined || isNaN(Number(productData.stock)) || Number(productData.stock) < 0) {
        return res.status(400).json({ error: 'Valid stock is required and must be positive' });
      }
      
      productData.price = Number(productData.price);
      productData.stock = Number(productData.stock);
      
      if (productData.image && productData.image.startsWith('data:image')) {
        try {
          productData.image = await uploadToCloudinary(productData.image);
        } catch (imageError: any) {
          return res.status(400).json({ error: 'Failed to upload image: ' + imageError.message });
        }
      }
      
      const product = new Product(productData);
      await product.save();
      
      res.status(201).json(product);
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map((err: any) => err.message);
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validationErrors
        });
      }
      
      res.status(400).json({ error: error.message });
    }
  },

  async updateProduct(req: AuthRequest, res: Response) {
    try {
      const productData = { ...req.body };
      
      if (productData.price !== undefined) {
        productData.price = Number(productData.price);
      }
      if (productData.stock !== undefined) {
        productData.stock = Number(productData.stock);
      }
      
      if (productData.image && productData.image.startsWith('data:image')) {
        try {
          productData.image = await uploadToCloudinary(productData.image);
        } catch (imageError: any) {
          return res.status(400).json({ error: 'Failed to upload image: ' + imageError.message });
        }
      }
      
      const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true, runValidators: true });
      if (!product) return res.status(404).json({ error: "Product not found" });
      
      res.json(product);
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map((err: any) => err.message);
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validationErrors
        });
      }
      
      res.status(400).json({ error: error.message });
    }
  },

  async deleteProduct(req: AuthRequest, res: Response) {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json({ message: "Product deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
};