import express from 'express';
import {
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    searchProducts,
} from '../controllers/product.controller.js';
import authenticate from '../middlewares/auth.middleware.js'
import authorize from '../middlewares/authorization.middleware.js'

const router = express.Router();

// Routes
router.post('/createProduct',authenticate, authorize('admin'), createProduct);
router.get('/getAllProducts', getAllProducts);
router.get('/getProductById/:id', getProductById);
router.delete('/deleteProduct/:id', deleteProduct);
router.post('/searchProducts', searchProducts);
router.post('/updateProduct/:id', updateProduct);

export default router;
