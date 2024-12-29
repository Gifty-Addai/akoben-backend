
export const bookingPending = ({ fullName, bookingId, tripId, selectedDate, numberOfPeople }) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h1 style="color: #4CAF50;">📌 Booking Pending</h1>
      <p>Hi ${fullName}, 😊</p>
      <p>Your booking request is received and is currently under review. Hang tight! 🕒</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Booking ID</th>
          <td style="padding: 8px; border: 1px solid #ddd;">${bookingId}</td>
        </tr>
        <tr>
          <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Trip ID</th>
          <td style="padding: 8px; border: 1px solid #ddd;">${tripId}</td>
        </tr>
        <tr>
          <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Selected Date</th>
          <td style="padding: 8px; border: 1px solid #ddd;">${new Date(selectedDate).toLocaleDateString()}</td>
        </tr>
        <tr>
          <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Number of People</th>
          <td style="padding: 8px; border: 1px solid #ddd;">${numberOfPeople}</td>
        </tr>
      </table>
      <p style="margin-top: 20px;">Thank you for choosing us! 🌟 We'll notify you once your booking is confirmed. Stay awesome! 🤗</p>
      <p>Cheers,<br/><strong>Fie Ne Fie Team 🎉</strong></p>
    </div>
  `;
};

export const bookingConfirmed = ({ fullName, bookingId, tripId, selectedDate }) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h1 style="color: #4CAF50;">✅ Booking Confirmed</h1>
      <p>Hi ${fullName}, 🎉</p>
      <p>Great news! Your booking has been confirmed. We can’t wait to see you on this adventure. 🌟</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Booking ID</th>
          <td style="padding: 8px; border: 1px solid #ddd;">${bookingId}</td>
        </tr>
        <tr>
          <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Trip ID</th>
          <td style="padding: 8px; border: 1px solid #ddd;">${tripId}</td>
        </tr>
        <tr>
          <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Selected Date</th>
          <td style="padding: 8px; border: 1px solid #ddd;">${new Date(selectedDate).toLocaleDateString()}</td>
        </tr>
      </table>
      <p style="margin-top: 20px;">Pack your bags, and let's create memories together! 🧳✈️</p>
      <p>Cheers,<br/><strong>Fie Ne Fie Team 🚀</strong></p>
    </div>
  `;
};

export const bookingRescheduled = ({ fullName, bookingId, newDate }) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h1 style="color: #FF9800;">⏰ Booking Rescheduled</h1>
      <p>Hi ${fullName}, 😊</p>
      <p>Your booking has been rescheduled successfully. Here are the updated details:</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Booking ID</th>
          <td style="padding: 8px; border: 1px solid #ddd;">${bookingId}</td>
        </tr>
        <tr>
          <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">New Date</th>
          <td style="padding: 8px; border: 1px solid #ddd;">${new Date(newDate).toLocaleDateString()}</td>
        </tr>
      </table>
      <p style="margin-top: 20px;">Thank you for your flexibility! Let’s make the most of this updated plan. 🗓️✨</p>
      <p>Cheers,<br/><strong>Fie Ne Fie Team 🚀</strong></p>
    </div>
  `;
};

export const bookingCancelled = ({ fullName, bookingId }) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h1 style="color: #F44336;">❌ Booking Cancelled</h1>
      <p>Hi ${fullName}, 😞</p>
      <p>We’re sorry to let you know that your booking has been cancelled. Here are the details:</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Booking ID</th>
          <td style="padding: 8px; border: 1px solid #ddd;">${bookingId}</td>
        </tr>
      </table>
      <p style="margin-top: 20px;">If you have any questions or want to rebook, we’re here for you! 💪✨</p>
      <p>Stay safe,<br/><strong>Fie Ne Fie Team ❤️</strong></p>
    </div>
  `;
};
