import ContactMessage from '../models/contactMessage.model.js';
import ApiResponse from '../lib/api-reponse.util.js';
import { sendMail } from '../services/mail.service.js';

// Create a new contact message (Public)
export const createContactMessage = async (req, res, next) => {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
        return ApiResponse.sendError(res, 'Name, email, and message are required fields.', 400);
    }

    try {
        const contactMessage = new ContactMessage({
            name,
            email,
            phone,
            message
        });

        await contactMessage.save();

        return ApiResponse.sendSuccess(res, 'Message sent successfully. We will get back to you soon!', contactMessage, 201);
    } catch (error) {
        console.error('Error creating contact message:', error);
        next(error);
    }
};

// Get contact messages (Admin)
export const getContactMessages = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status; // optional: unread, read, replied
        const search = req.query.search; // optional search query

        const query = {};
        if (status) {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }

        const totalMessages = await ContactMessage.countDocuments(query);
        const totalPages = Math.ceil(totalMessages / limit);
        const skip = (page - 1) * limit;

        const messages = await ContactMessage.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return ApiResponse.sendSuccessWithPagination(
            res,
            'Contact messages retrieved successfully',
            messages,
            page,
            totalPages,
            totalMessages
        );
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        next(error);
    }
};

// Update message status (Admin)
export const updateContactMessageStatus = async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['unread', 'read'].includes(status)) {
        return ApiResponse.sendError(res, 'Invalid status. Can only set to unread or read.', 400);
    }

    try {
        const message = await ContactMessage.findById(id);

        if (!message) {
            return ApiResponse.sendError(res, 'Message not found.', 404);
        }

        // If the message has already been replied, do not allow changing to unread/read
        if (message.status === 'replied') {
            return ApiResponse.sendError(res, 'Cannot change status of a replied message.', 400);
        }

        message.status = status;
        await message.save();

        return ApiResponse.sendSuccess(res, `Message status updated to ${status}`, message);
    } catch (error) {
        console.error('Error updating contact message status:', error);
        next(error);
    }
};

// Reply to contact message (Admin)
export const replyContactMessage = async (req, res, next) => {
    const { id } = req.params;
    const { replyMessage } = req.body;

    if (!replyMessage) {
        return ApiResponse.sendError(res, 'Reply message content is required.', 400);
    }

    try {
        const message = await ContactMessage.findById(id);

        if (!message) {
            return ApiResponse.sendError(res, 'Message not found.', 404);
        }

        // Build HTML email body
        const subject = `Re: Your Message to Akoben / Fie Ne Fie`;
        const htmlBody = `
            <div style="font-family: sans-serif; padding: 20px; background-color: #f7f7f7; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; border: 1px solid #ddd; background: #ffffff;">
                <h2 style="color: #4A6741; border-bottom: 2px solid #4A6741; padding-bottom: 10px; margin-top: 0;">Fie Ne Fie Support</h2>
                <p>Hi ${message.name},</p>
                <p>Thank you for reaching out to us. Here is our reply to your query:</p>
                <div style="background-color: #f0f4ef; padding: 15px; border-left: 4px solid #4A6741; margin: 15px 0; border-radius: 4px; font-style: italic; white-space: pre-line;">
                  ${replyMessage}
                </div>
                <div style="margin-top: 25px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 15px;">
                  <p><strong>Your Original Message:</strong></p>
                  <p style="white-space: pre-wrap; font-style: italic; color: #555;">${message.message}</p>
                </div>
              </div>
            </div>
        `;

        // Send email
        await sendMail(message.email, subject, htmlBody);

        // Update message status in DB
        message.status = 'replied';
        message.replyMessage = replyMessage;
        message.repliedAt = new Date();
        await message.save();

        return ApiResponse.sendSuccess(res, 'Reply sent and saved successfully.', message);
    } catch (error) {
        console.error('Error replying to contact message:', error);
        next(error);
    }
};

// Delete contact message (Admin)
export const deleteContactMessage = async (req, res, next) => {
    const { id } = req.params;

    try {
        const message = await ContactMessage.findByIdAndDelete(id);

        if (!message) {
            return ApiResponse.sendError(res, 'Message not found.', 404);
        }

        return ApiResponse.sendSuccess(res, 'Message deleted successfully.', null);
    } catch (error) {
        console.error('Error deleting contact message:', error);
        next(error);
    }
};
