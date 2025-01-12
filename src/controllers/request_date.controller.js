import ApiResponse from "../lib/api-reponse.util.js";
import Request from "../models/request_date.model.js"

/**
 * Create a new request.
 * 
 * Expected req.body properties:
 *  - name (string)
 *  - phone (string)
 *  - email (string)
 *  - startDate (Date)
 *  - endDate (Date)
 *  - tripId (string) 
 *  - tripName (string)
 */
export const createRequest = async (req, res, next) => {
    const { tripId } = req.params;
    const { name, phone, email, startDate, endDate, tripName } = req.body;

    // Basic field checks (adjust as needed)
    if (!name || !phone || !email || !startDate || !endDate || !tripId || !tripName) {
        return ApiResponse.sendError(res, "All fields are required: name, phone, email, startDate, endDate, tripId, tripName", 400);
    }

    try {
        const existingRequest = await Request.findOne({ email, tripId, startDate, endDate });
        if (existingRequest) {
            return ApiResponse.sendError(res, "A similar request already exists", 400);
        }

        const newRequest = new Request({
            name,
            phone,
            email,
            startDate,
            endDate,
            tripId,
            tripName,
        });

        await newRequest.save();

        return ApiResponse.sendSuccess(res, "Request created successfully", { sent: true });
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single request by ID.
 */
export const getRequestById = async (req, res, next) => {
    const { id } = req.params;

    try {
        const request = await Request.findById(id);

        if (!request) {
            return ApiResponse.sendError(res, "Request not found", 404);
        }

        // Return the found request
        return ApiResponse.sendSuccess(res, "", request);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all requests (with simple pagination).
 * 
 * Query params:
 *  - page (default 1)
 *  - limit (default 10)
 */
export const getAllRequests = async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        const skip = (page - 1) * limit;

        const requests = await Request.find()
            .skip(Number(skip))
            .limit(Number(limit));

        const totalRequests = await Request.countDocuments();

        return ApiResponse.sendSuccess(res, "", {
            requests,
            currentPage: Number(page),
            totalPages: Math.ceil(totalRequests / limit),
            totalRequests,
        });
    } catch (error) {
        next(error);
    }
};
