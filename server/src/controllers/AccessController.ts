import {Request, Response, Router} from "express";
import {HttpRequestError} from "./../helper/HttpRequestError";
import {AccessService} from "./../services/accessService";

// Assign our router to the express router instance.
const router: Router = Router();

// 1. Client requests a device id.
// 2. Client requests verification email.
// 3. Client clicks link in email.
// 4. Client requests access token.

// Returns a device token.
router.post("/device", (req: Request, res: Response) => {
    if (!isBodyValid(req, res)) {
        return;
    }

    AccessService.getDeviceToken(req.body.username)
        .then((value) => {
            res.status(200); // OK.
            res.send({device_token: value});
        })
        .catch((err: HttpRequestError) => {
            res.status(err.status);
            res.send(`Error: ${err.message}`);
        });
});

// Sends a verification email to the user.
router.post("/email", (req: Request, res: Response) => {
    if (!isBodyValid(req, res)) {
        return;
    }

    AccessService.sendVerificationEmail(req.body.username, req.body.device_token)
        .then((value) => {
            res.status(200); // OK.
            res.send(value);
        })
        .catch((err: HttpRequestError) => {
            res.status(err.status);
            res.send(`Error: ${err.message}`);
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
            res.send(`Error: ${err.message}`);
        });
});

// Returns an access token.
router.post("/token", (req: Request, res: Response) => {
    if (!isBodyValid(req, res)) {
        return;
    }

    AccessService.getAccessToken(req.body.username, req.body.device_token)
        .then((value) => {
            res.status(200); // OK.
            res.send({access_token: value});
        })
        .catch((err: HttpRequestError) => {
            res.status(err.status);
            res.send(`Error: ${err.message}`);
        });
});

// Checks if the body is undefined then sends the correct respone if so.
function isBodyValid(req: Request, res: Response): boolean {
    if (req.body === undefined) {
        res.status(400);
        res.send("Error: No body given.");
        return false;
    }

    return true;
}

export const AccessController: Router = router;
