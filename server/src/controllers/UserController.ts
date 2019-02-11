import {Request, Response, Router} from "express";
import {HttpRequestError} from "../helper/HttpRequestError";
import * as UserService from "../services/UserService";

// Assign our router to the express router instance.
const router: Router = Router();

/**
 * Endpoint to allow clients to update their FCM token.
 */
router.post("/fcm-token", (req: Request, res: Response) => {
    UserService.setFCMToken(req.get("username") as string, req.body.fcm_token)
        .then((value) => {
            res.sendStatus(200); // OK.
        })
        .catch((err: HttpRequestError) => {
            res.status(err.status);
            res.send(err.message);
        });
});

/**
 * Endpoint to allow clients to submit feedback.
 */
router.post("/feedback", (req: Request, res: Response) => {
    UserService.submitFeedback(req.get("username") as string, req.body.feedback)
        .then(() => {
            res.sendStatus(200);
        })
        .catch((err: HttpRequestError) => {
            res.status(err.status);
            res.send(err.message);
        });
});

export const UserController: Router = router;
