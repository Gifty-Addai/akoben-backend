
export const bookingPending = ({ fullName, bookingId, tripId, selectedDate, numberOfPeople }) => {
  return `
    <h1>Booking Confirmation</h1>
    <p>Dear ${fullName},</p>
    <p>Thank you for booking with us! Your booking ID is <strong>${bookingId}</strong>.</p>
    <p><strong>Details:</strong></p>
    <ul>
      <li><strong>Trip ID:</strong> ${tripId}</li>
      <li><strong>Selected Date:</strong> ${new Date(selectedDate).toLocaleDateString()}</li>
      <li><strong>Number of People:</strong> ${numberOfPeople}</li>
    </ul>
    <p>We look forward to serving you.</p>
    <p>Best regards,<br/>Fie Ne Fie Team</p>
  `;
};
