import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            comment: "Price at time of purchase"
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'ReadyForPickup', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    deliveryMethod: {
        type: String,
        enum: ['Shipping', 'Pickup'],
        required: true
    },
    shippingAddress: {
        street: { type: String },
        city: { type: String },
        zipCode: { type: String },
        country: { type: String, default: 'Ghana' }
    },
    pickupLocation: {
        type: String,
        comment: "Store location if Pickup is selected"
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    paymentMethod: {
        type: String,
        enum: ['Card', 'CashOnDelivery', 'Paystack'],
        default: 'CashOnDelivery'
    }
}, { timestamps: true });

// Validation to ensure address is present if shipping is selected
orderSchema.pre('save', function (next) {
    if (this.deliveryMethod === 'Shipping' && !this.shippingAddress.street) {
        return next(new Error('Shipping address is required for shipping orders.'));
    }
    if (this.deliveryMethod === 'Pickup' && !this.pickupLocation) {
        // Default pickup location if not provided
        this.pickupLocation = 'Main Store';
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
