import * as mail from "nodemailer";
import { HttpRequestError } from "../helper/HttpRequestError";
import { hostName } from "./../Server";

const EMAIL = "safesellyregister@gmail.com";
const EMAIL_PASSWORD = "zimsaz-wyznUc-8qefxi";
const EMAIL_SERVICE = "gmail";

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
            http://${hostName}/access/verify/${verificationToken}`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        throw new HttpRequestError(500, "Internal Server Error");
    }
}
