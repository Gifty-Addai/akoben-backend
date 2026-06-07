import Product from "../models/product.model.js";
import { toProperCase } from "../lib/utils.js";
import ApiResponse from "../lib/api-reponse.util.js";


export const createProduct = async (req, res, next) => {

    const { name, description, price, category, subCategory, image, stock, isAvailable } = req.body;

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
                subCategory: category === 'tallow' ? (subCategory || 'Oils') : subCategory,
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
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const skip = (pageNum - 1) * limitNum;

        const products = await Product.find()
            .skip(skip)
            .limit(limitNum);

        const totalProducts = await Product.countDocuments();
        const activeProducts = await Product.countDocuments({ isAvailable: true });

        return ApiResponse.sendSuccess(res, "", {
            products,
            currentPage: pageNum,
            totalPages: Math.ceil(totalProducts / limitNum),
            totalProducts,
            activeProducts
        });
    } catch (error) {
        next(error);
    }
};

export const getTallowProducts = async (req, res, next) => {
    const { page = 1, limit = 10, all = false, subCategory } = req.query;

    try {
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const skip = (pageNum - 1) * limitNum;

        const filter = { category: 'tallow' };
        if (subCategory) {
            filter.subCategory = subCategory;
        }
        if (all !== 'true' && all !== true) {
            filter.isAvailable = true;
        }

        const activeFilter = { category: 'tallow', isAvailable: true };
        if (subCategory) {
            activeFilter.subCategory = subCategory;
        }

        // Run queries in parallel to reduce latency
        const [products, totalTallowProducts, activeTallowProducts] = await Promise.all([
            Product.find(filter).select('-clickCount').skip(skip).limit(limitNum),
            Product.countDocuments(filter),
            Product.countDocuments(activeFilter)
        ]);

        const totalAllTallowFilter = { category: 'tallow' };
        if (subCategory) {
            totalAllTallowFilter.subCategory = subCategory;
        }
        const totalAllTallowProducts = await Product.countDocuments(totalAllTallowFilter);
        const inActiveTallowProducts = totalAllTallowProducts - activeTallowProducts;

        return ApiResponse.sendSuccess(res, "", {
            products,
            currentPage: pageNum,
            totalPages: Math.ceil(totalTallowProducts / limitNum),
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
    let { name, category, subCategory, minPrice, maxPrice, isAvailable, page = 1, limit = 10 } = req.body;

    try {
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        
        const filters = {};

        if (name) {
            filters.name = { $regex: new RegExp(name, 'i') };
        }

        if (category) filters.category = { $regex: new RegExp(category, 'i') };
        if (subCategory) filters.subCategory = subCategory;

        if (minPrice) filters.price = { ...filters.price, $gte: Number(minPrice) };
        if (maxPrice) filters.price = { ...filters.price, $lte: Number(maxPrice) };

        if (isAvailable !== undefined) {
            filters.isAvailable = isAvailable === 'true' || isAvailable === true;
        }

        const skip = (pageNum - 1) * limitNum;

        // Query the database with pagination
        const products = await Product.find(filters)
            .skip(skip)
            .limit(limitNum);

        const totalProducts = await Product.countDocuments(filters);
        const activeProducts = await Product.countDocuments({ ...filters, isAvailable: true });
        const inActiveProducts = await Product.countDocuments({ ...filters, isAvailable: false });


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
                currentPage: pageNum,
                totalPages: Math.ceil(totalProducts / limitNum),
                totalProducts: randomProducts.length,
                isSuggestion: true,
                activeProducts,
                inActiveProducts
            });
        }

        return ApiResponse.sendSuccess(res, "Product found", {
            products,
            currentPage: pageNum,
            totalPages: Math.ceil(totalProducts / limitNum),
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
    const { name, description, price, category, subCategory, image, stock, isAvailable } = req.body;
    const { id } = req.params;

    if (!name && !description && !price && !category && subCategory === undefined && !image && !isAvailable) {
        return ApiResponse.sendError(res, "At least one field (name, description, price, category, subCategory, image, isAvailable) must be provided to update", 400);
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
        if (category) {
            product.category = category;
            if (category !== 'tallow') {
                product.subCategory = undefined;
            } else if (!product.subCategory && !subCategory) {
                product.subCategory = 'Oils';
            }
        }
        if (subCategory !== undefined) {
            product.subCategory = subCategory || (product.category === 'tallow' ? 'Oils' : undefined);
        }
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
