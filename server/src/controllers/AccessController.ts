import {Request, Response, Router} from "express";
import {HttpRequestError} from "../helper/HttpRequestError";
import * as UserService from "../services/UserService";

// Assign our router to the express router instance.
const router: Router = Router();

// PROTOCOL:
// 1. Client requests a device token.
// 2. Client requests verification email.
// 3. Client clicks link in email.
// 4. Client requests access token.

/**
 * Returns a device token.
 */
router.get("/device-token", (req: Request, res: Response) => {
    UserService.getDeviceToken(req.get("username") as string)
        .then((value) => {
            res.status(200); // OK.
            res.send({device_token: value});
        })
        .catch((err: HttpRequestError) => {
            res.status(err.status);
            res.send(err.message);
        });
});

/**
 * Sends a verification email to the user.
 */
router.get("/send-email", (req: Request, res: Response) => {
    UserService.sendVerificationEmail(req.get("username") as string, req.get("device-token") as string)
        .then((value) => {
            res.status(200); // OK.
            res.send(value);
        })
        .catch((err: HttpRequestError) => {
            res.status(err.status);
            res.send(err.message);
        });
});

/**
 * Verifies the user (they click this link in the email).
 */
router.get("/verify/:token", (req: Request, res: Response) => {
    const token = req.params.token;

    UserService.verifyDevice(token)
        .then(() => {
            res.status(200);
            res.send("Registered successfully! Follow the instructions within the app. You can close this window.");
        })
        .catch((err: HttpRequestError) => {
            res.status(err.status);
            res.send("This link is not valid. Please use the latest link in your inbox.");
        });
});

/**
 * Returns an access token for the user and device.
 */
router.get("/access-token", (req: Request, res: Response) => {
    UserService.getAccessToken(req.get("username") as string, req.get("device-token") as string)
        .then((value) => {
            res.status(200); // OK.
            res.send({access_token: value});
        })
        .catch((err: HttpRequestError) => {
            res.status(err.status);
            res.send(err.message);
        });
});

export const AccessController: Router = router;
