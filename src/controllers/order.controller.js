import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import ApiResponse from '../lib/api-reponse.util.js';

// --- Delivery Fee Logic ("Option 2") ---
const DELIVERY_FLAT_RATE = 15;
const FREE_SHIPPING_THRESHOLD = 100;

export const createOrder = async (req, res, next) => {
    try {
        const { products, deliveryMethod, shippingAddress, pickupLocation, paymentMethod } = req.body;
        const userId = req.user._id;

        if (!products || products.length === 0) {
            return ApiResponse.sendError(res, "Order must contain at least one product", 400);
        }

        let calculatedTotal = 0;
        const orderProducts = [];

        // Validate products and calculate total from DB prices (security)
        for (const item of products) {
            const product = await Product.findById(item.product);
            if (!product) {
                return ApiResponse.sendError(res, `Product not found: ${item.product}`, 400);
            }
            // Check stock? (Optional improvement)

            const itemTotal = product.price * item.quantity;
            calculatedTotal += itemTotal;

            orderProducts.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price
            });
        }

        // Calculate Delivery Fee
        let deliveryFee = 0;
        if (deliveryMethod === 'Shipping') {
            if (calculatedTotal < FREE_SHIPPING_THRESHOLD) {
                deliveryFee = DELIVERY_FLAT_RATE;
            }
        }

        const finalTotal = calculatedTotal + deliveryFee;

        // Create Order
        const newOrder = new Order({
            user: userId,
            products: orderProducts,
            totalAmount: finalTotal,
            deliveryFee: deliveryFee,
            deliveryMethod,
            shippingAddress: deliveryMethod === 'Shipping' ? shippingAddress : undefined,
            pickupLocation: deliveryMethod === 'Pickup' ? pickupLocation : undefined,
            paymentMethod: paymentMethod || 'CashOnDelivery',
            paymentStatus: 'Pending',
            status: 'Pending'
        });

        await newOrder.save();

        return ApiResponse.sendSuccess(res, "Order placed successfully", newOrder, 201);

    } catch (error) {
        next(error);
    }
};

export const getUserOrders = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const orders = await Order.find({ user: userId })
            .populate('products.product', 'name imageUrl price')
            .sort({ createdAt: -1 });

        return ApiResponse.sendSuccess(res, "User orders fetched", orders);
    } catch (error) {
        next(error);
    }
};

export const getAllOrders = async (req, res, next) => {
    try {
        // basic pagination
        const { page = 1, limit = 20, status } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (status) query.status = status;

        const orders = await Order.find(query)
            .populate('user', 'name email phone')
            .populate('products.product', 'name')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });

        const total = await Order.countDocuments(query);

        return ApiResponse.sendSuccess(res, "All orders fetched", {
            orders,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!order) return ApiResponse.sendError(res, "Order not found", 404);

        return ApiResponse.sendSuccess(res, "Order status updated", order);
    } catch (error) {
        next(error);
    }
};
