import express from 'express';
import {
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    searchProducts,
} from '../controllers/product.controller.js';

const router = express.Router();

// Routes
router.post('/createProduct', createProduct);
router.get('/getAllProducts', getAllProducts);
router.get('/getProductById/:id', getProductById);
router.delete('/deleteProduct/:id', deleteProduct);
router.get('/searchProducts', searchProducts);
router.post('/updateProduct/:id', updateProduct);

export default router;
