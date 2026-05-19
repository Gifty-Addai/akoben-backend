import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';
import ApiResponse from '../lib/api-reponse.util.js';

export const getDashboardStats = async (req, res, next) => {
    try {
        // 1. Total Sales (Sum of totalAmount for non-cancelled orders)
        const totalSalesResult = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].total : 0;

        // 2. Total Orders
        const totalOrders = await Order.countDocuments();

        // 3. Total Products
        const totalProducts = await Product.countDocuments();

        // 4. Total Customers (Users)
        const totalCustomers = await User.countDocuments({ role: 'user' });

        // 5. Recent Orders (Last 5)
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email')
            .populate('products.product', 'name');

        // 6. Sales by Region (City)
        const salesByRegion = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' }, deliveryMethod: 'Shipping' } },
            { $group: { _id: "$shippingAddress.city", count: { $sum: 1 }, total: { $sum: "$totalAmount" } } },
            { $sort: { total: -1 } }
        ]);

        return ApiResponse.sendSuccess(res, "Dashboard stats fetched successfully", {
            totalSales,
            totalOrders,
            totalProducts,
            totalCustomers,
            recentOrders,
            salesByRegion
        });
    } catch (error) {
        next(error);
    }
};
