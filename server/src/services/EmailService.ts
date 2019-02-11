import * as mail from "nodemailer";
import { HttpRequestError } from "../helper/HttpRequestError";
import * as config from "./../config.json";
import * as log from "./../helper/Logger";

const EMAIL = config.email;
const EMAIL_PASSWORD = config.emailPassword;
const EMAIL_SERVICE = config.emailService;

const transporter = mail.createTransport({
    service: EMAIL_SERVICE,
    auth: {
        user: EMAIL,
        pass: EMAIL_PASSWORD,
    },
});

/**
 * Sends the registration email to the users email address.
 * @param username
 * @param verificationToken
 */
export async function sendRegisterEmail(username: string, verificationToken: string) {
    const mailOptions = {
        from: EMAIL,
        to: username + "@bham.ac.uk",
        subject: "Register for Safe Selly App",
        text:
            `Click the link to register then follow the instructions within the app. \n
            ${config.hostName}${config.prefix}/access/verify/${verificationToken}`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        log.error("Failed to send registration email: " + err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}

/**
 * Sends an email to my personal email address so I can quickly review feedback.
 * @param username The user who sent this feedback.
 * @param feedback The feedback that will be sent.
 */
export async function sendFeedbackEmail(username: string, feedback: string) {
    const mailOptions = {
        from: EMAIL,
        to: "maximuswaterfall@gmail.com",
        subject: "Feedback from " + username,
        text: feedback,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        log.error("Failed to send feedback email: " + err);
    }
}
