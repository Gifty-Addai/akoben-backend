import Product from "../models/product.model.js";
import { toProperCase } from "../lib/utils.js";
import ApiResponse from "../lib/api-reponse.util.js";


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
            return ApiResponse.sendError(res, `Product with name: ${formattedName} exists with the description. Try editing the description`, 400)
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

        return ApiResponse.sendSuccess(res, 'Product created succesfully')

    } catch (error) {
        next(error);
    }
};

export const getAllProducts = async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        const skip = (page - 1) * limit;

        const products = await Product.find()
            .skip(skip)
            .limit(Number(limit));

        const totalProducts = await Product.countDocuments();
        const activeProducts = await Product.countDocuments({ isAvailable: true });

        return ApiResponse.sendSuccess(res, "", {
            products,
            currentPage: Number(page),
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts,
            activeProducts
        });
    } catch (error) {
        next(error);
    }
};

export const getTallowProducts = async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;

    try {


        const skip = (page - 1) * limit;

        // Run queries in parallel to reduce latency
        const [products, totalTallowProducts, activeTallowProducts] = await Promise.all([
            Product.find({ category: 'tallow' }).select('-clickCount').skip(skip).limit(Number(limit)),
            Product.countDocuments({ category: 'tallow' }),
            Product.countDocuments({ category: 'tallow', isAvailable: true })
        ]);

        const inActiveTallowProducts = totalTallowProducts - activeTallowProducts;

        return ApiResponse.sendSuccess(res, "", {
            products,
            currentPage: Number(page),
            totalPages: Math.ceil(totalTallowProducts / limit),
            totalProducts: totalTallowProducts,
            activeProducts: activeTallowProducts,
            inActiveProducts: inActiveTallowProducts
        });
    } catch (error) {
        next(error);
    }
};



export const getProductById = async (req, res, next) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id).select('-clickCount');

        if (!product) {
            return ApiResponse.sendError(res, `Product with id: ${id} not found`, 400);
        }

        return ApiResponse.sendSuccess(res, "Fetched", product, 200)
    } catch (error) {
        next(error);
    }
};

export const searchProducts = async (req, res, next) => {
    let { name, category, minPrice, maxPrice, isAvailable, page = 1, limit = 10 } = req.body;

    try {
        const filters = {};

        if (name || category && page != 1) {
            page = 1
        }

        if (name) {
            filters.name = { $regex: new RegExp(name, 'i') };
        }

        if (category) filters.category = { $regex: new RegExp(category, 'i') };

        if (minPrice) filters.price = { ...filters.price, $gte: Number(minPrice) };
        if (maxPrice) filters.price = { ...filters.price, $lte: Number(maxPrice) };

        if (isAvailable !== undefined) {
            filters.isAvailable = isAvailable === 'true' || isAvailable === true;
        }

        const skip = (page - 1) * limit;

        // Query the database with pagination
        const products = await Product.find(filters)
            .skip(skip)
            .limit(Number(limit));

        const totalProducts = await Product.countDocuments(filters);
        const activeProducts = await Product.countDocuments({ isAvailable: true });
        const inActiveProducts = await Product.countDocuments({ isAvailable: false });


        if (products.length === 0) {
            const matchStage = { isAvailable: true };

            // If category was specified in the original search, respect it in suggestions
            if (category) {
                matchStage.category = { $regex: new RegExp(category, 'i') };
            }

            const randomProducts = await Product.aggregate([
                { $match: matchStage },
                { $sample: { size: 100 } },
            ]);

            return ApiResponse.sendSuccess(res, "", {
                products: randomProducts,
                currentPage: Number(page),
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts: randomProducts.length,
                isSuggestion: true,
                activeProducts,
                inActiveProducts
            });
        }

        return ApiResponse.sendSuccess(res, "Product found", {
            products,
            currentPage: Number(page),
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts,
            isSuggestion: false,
            activeProducts,
            inActiveProducts,

        });
    } catch (error) {
        next(error);
    }
};




export const updateProduct = async (req, res, next) => {
    const { name, description, price, category, image, stock, isAvailable } = req.body;
    const { id } = req.params;

    if (!name && !description && !price && !category && !image && !isAvailable) {
        return ApiResponse.sendError(res, "At least one field (name, description, price, category, image, isAvailable) must be provided to update", 400);
    }

    try {
        // Find the product by its ID
        const product = await Product.findById(id);

        if (!product) {
            return ApiResponse.sendError(res, `Product with id: ${id} not found`, 400)
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

        return ApiResponse.sendSuccess(res, 'Product updated successfully!', product, 200)
    } catch (error) {
        next(error);
    }
};




export const deleteProduct = async (req, res, next) => {
    const { id } = req.params;

    try {
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return ApiResponse.sendError(res, `Product with id: ${id} not found`, 400)
        }

        return ApiResponse.sendSuccess(res, 'Product deleted successfully!');
    } catch (error) {
        next(error);
    }
};

export const trackProductClick = async (req, res, next) => {
    const { id } = req.params;
    try {
        await Product.findByIdAndUpdate(id, { $inc: { clickCount: 1 } });
        console.log(`Click tracked for product ${id}`); // Log for visibility
        return ApiResponse.sendSuccess(res, "Click tracked");
    } catch (error) {
        next(error);
    }
};
