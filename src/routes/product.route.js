import express from 'express';
import {
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    searchProducts,
} from '../controllers/product.controller.js';
import authorize from '../middlewares/authorization.middleware.js'
import { verifyAccessToken } from '../middlewares/verify-token.middleware.js';

const router = express.Router();

// Routes
router.post('/createProduct',verifyAccessToken, authorize('admin'), createProduct);
router.get('/getAllProducts', getAllProducts);
router.get('/getProductById/:id', getProductById);
router.delete('/deleteProduct/:id',verifyAccessToken, authorize('admin'),  deleteProduct);
router.post('/searchProducts', searchProducts);
router.post('/updateProduct/:id',verifyAccessToken, authorize('admin'),  updateProduct);

export default router;
