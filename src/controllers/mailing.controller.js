import { sendMail } from "../services/mail.service.js";
import { bookingConfirmed, bookingCancelled, bookingRescheduled, bookingPending } from "../html/htmls.js";
import ApiResponse from "../lib/api-reponse.util.js";
import Booking from "../models/booking.model.js";


export const sendBookingMail = async (req, res, next) => {
    const { confirm, pending, reschedule, cancel, bookingId } = req.body;

    try {
        const booking = await Booking.findById(bookingId).populate('user trip');

        if (!booking) {
            return ApiResponse.sendError(res, 'Booking not found', 404);
        }

        const { user, trip, selectedDateId, numberOfPeople, rescheduleDate } = booking;
        const fullName = user?.name || "Customer";
        const email = user?.email || "";
        const tripId = trip?._id || "";

        let htmlBody;
        let subject;

        if (pending) {
            subject = "📌 Booking Pending - Fie Ne Fie";
            htmlBody = bookingPending({ fullName, bookingId, tripId, selectedDate: selectedDateId, numberOfPeople });
        } else if (confirm) {
            subject = "✅ Booking Confirmed - Fie Ne Fie";
            htmlBody = bookingConfirmed({ fullName, bookingId, tripId, selectedDate: selectedDateId });
        } else if (reschedule) {
            subject = "⏰ Booking Rescheduled - Fie Ne Fie";
            htmlBody = bookingRescheduled({ fullName, bookingId, newDate: rescheduleDate });
        } else if (cancel) {
            subject = "❌ Booking Cancelled - Fie Ne Fie";
            htmlBody = bookingCancelled({ fullName, bookingId });
        } else {
            return ApiResponse.sendError(res, 'Invalid request, no email type specified', 400);
        }

        // Send the email
        if (email) {
            await sendMail(email, subject, htmlBody);

            return ApiResponse.sendSuccess(res, `Email sent for ${subject}`)
        } else {
            return ApiResponse.sendError(res, 'User email not available', 400);
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
};
