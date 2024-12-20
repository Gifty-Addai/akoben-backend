// import nodemailer from 'nodemailer';

// // Create the transporter once
// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false, 
//     auth: {
//         user: process.env.MAIL,
//         pass: process.env.APP_PASS,
//     },
//     logger: true, // Enable logging for debugging
//     debug: true,  // Enable debug output
// });



// // Verify the transporter configuration
// transporter.verify((error, success) => {
//     if (error) {
//         console.error("Error configuring the email transporter:", error);
//     } else {
//         console.log("Email transporter is configured successfully.");
//     }
// });

// /**
//  * Sends an email using the configured transporter.
//  *
//  * @param {string} to - Recipient email address
//  * @param {string} subject - Subject of the email
//  * @param {string} htmlBody - HTML content of the email
//  */
// export const sendMail = async (to, subject, htmlBody) => {
//     try {
//         await transporter.sendMail({
//             from: '"Fie Ne Fie 👻" <luckyceci789@gmail.com>',
//             to, // Recipient address
//             subject, // Subject line
//             html: htmlBody, // HTML body content
//         });
//         console.log("Email sent to", to);
//     } catch (error) {
//         console.error("Error sending email to", to, ":", error);
//         // Optionally, you can throw the error to handle it upstream
//         // throw AppError();
//     }
// };
import mailjet from 'node-mailjet';
import dotenv from 'dotenv';

dotenv.config();

const mailjetClient = mailjet.apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_SECRET_KEY);

/**
 * Sends an email using Mailjet.
 *
 * @param {string} to - Recipient email address
 * @param {string} subject - Subject of the email
 * @param {string} htmlBody - HTML content of the email
 */
export const sendMail = async (to, subject, htmlBody) => {
    const request = mailjetClient.post("send", { 'version': 'v3.1' }).request({
        "Messages": [
            {
                "From": {
                    "Email": process.env.FROM_EMAIL,
                    "Name": process.env.FROM_NAME
                },
                "To": [
                    {
                        "Email": to,
                        "Name": "Recipient Name" // Optional
                    }
                ],
                "Subject": subject,
                "HTMLPart": htmlBody
            }
        ]
    });

    try {
        const result = await request;
        console.log(`Email sent to ${to}:`, result.body);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
        if (error.response && error.response.body) {
            console.error('Mailjet Response:', error.response.body);
        }
        // Optionally, handle specific error cases or rethrow
    }
};