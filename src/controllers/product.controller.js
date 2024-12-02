import Product from "../models/product.model.js";
import { toProperCase } from "../lib/utils.js";


export const createProduct = async (req, res, next) => {

    const { name, description, price, category, image, stock, isAvailable } = req.body;

    if (!name || !description || !price) {
        return res.status(400).json({ message: "name, description, price, are required" });
    }

    try {

        const formattedName = toProperCase(name);
        const formattedDescription = toProperCase(description);

        const productExit = await Product.findOne({ name: formattedDescription });
        if (productExit) {
            return res.status(400).json({ message: `Product with name: ${formattedName} exists with the description. Try editing the description` });
        }

        const newProduct = new Product(
            {
                name: formattedName,
                description: formattedDescription,
                price: price,
                category: category,
                imageUrl: image,
                isAvailable: isAvailable,
                stock: stock
            }
        );

        await newProduct.save();

        res.status(201).json({ message: 'Product created successfully!' });

    } catch (error) {
        next(error);
    }
};

export const getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
};

export const getProductById = async (req, res, next) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: `Product with id: ${id} not found` });
        }

        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
};

export const searchProducts = async (req, res, next) => {
    const { name, category, minPrice, maxPrice, isAvailable } = req.body;  
    try {
        const filters = {};

        // Case-insensitive search for 'name'
        if (name) {
            filters.name = { $regex: new RegExp(name, 'i') }; 
         }

        // Optional case-insensitive category search
        if (category) filters.category = { $regex: new RegExp(category, 'i') };

        // Filter by price range if provided
        if (minPrice) filters.price = { ...filters.price, $gte: Number(minPrice) };
        if (maxPrice) filters.price = { ...filters.price, $lte: Number(maxPrice) };

        // Filter availability (boolean check)
        if (isAvailable !== undefined) filters.isAvailable = isAvailable === 'true';

        // Query the database
        const products = await Product.find(filters);

        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
};


export const updateProduct = async (req, res, next) => {
    const { name, description, price, category, image,stock, isAvailable } = req.body;
    const { id } = req.params;

    if (!name && !description && !price && !category && !image && !isAvailable) {
        return res.status(400).json({ message: "At least one field (name, description, price, category, image, isAvailable) must be provided to update" });
    }

    try {
        // Find the product by its ID
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: `Product with id: ${id} not found` });
        }

        // Update the product details
        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = price;
        if (category) product.category = category;
        if (image) product.imageUrl = image;
        if (stock) product.stock = stock;
        if (isAvailable !== undefined) product.isAvailable = isAvailable;

        // Save the updated product
        await product.save();

        res.status(200).json({ message: 'Product updated successfully!', product });
    } catch (error) {
        next(error);
    }
};




export const deleteProduct = async (req, res, next) => {
    const { id } = req.params;

    try {
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({ message: `Product with id: ${id} not found` });
        }

        res.status(200).json({ message: 'Product deleted successfully!' });
    } catch (error) {
        next(error);
    }
};
