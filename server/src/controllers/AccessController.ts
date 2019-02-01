import {Request, Response, Router} from "express";
import {HttpRequestError} from "./../helper/HttpRequestError";
import * as AccessService from "./../services/AccessService";
import { isBodyValid } from "./Validator";

// Assign our router to the express router instance.
const router: Router = Router();

// 1. Client requests a device token.
// 2. Client requests verification email.
// 3. Client clicks link in email.
// 4. Client requests access token.

// Returns a device token.
router.get("/device-token", (req: Request, res: Response) => {
    AccessService.getDeviceToken(req.get("username") as string)
        .then((value) => {
            res.status(200); // OK.
            res.send({device_token: value});
        })
        .catch((err: HttpRequestError) => {
            res.status(err.status);
            res.send(err.message);
        });
});

// Sends a verification email to the user.
router.get("/send-email", (req: Request, res: Response) => {
    AccessService.sendVerificationEmail(req.get("username") as string, req.get("device_token") as string)
        .then((value) => {
            res.status(200); // OK.
            res.send(value);
        })
        .catch((err: HttpRequestError) => {
            res.status(err.status);
            res.send(err.message);
        });
});

// Verifies the user (they click this link in the email).
router.get("/verify/:token", (req: Request, res: Response) => {
    const token = req.params.token;

    AccessService.verifyDevice(token)
        .then(() => {
            res.sendStatus(200);
        })
        .catch((err: HttpRequestError) => {
            res.status(err.status);
            res.send(err.message);
        });
});

// Returns an access token.
router.get("/access-token", (req: Request, res: Response) => {
    AccessService.getAccessToken(req.get("username") as string, req.get("device_token") as string)
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
