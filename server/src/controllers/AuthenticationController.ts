import {Request, Response, Router} from "express";
import {HttpRequestError} from "../helper/HttpRequestError";
import * as AuthenticationService from "./../services/AuthenticationService";

// Assign our router to the express router instance.
const router: Router = Router();

// Checks the request is authorized and valid.
router.use((req: Request, res: Response, next) => {
    // Extract access_token, username from the header.
    const accessToken = req.get("access-token") as string;
    const username = req.get("username") as string;

    // Check access token is valid for this username.
    AuthenticationService.isRequestAuthorised(username, accessToken)
        .then(() => {
            next();
        })
        .catch((err: HttpRequestError) => {
            res.status(err.status);
            res.send("Error: " + err.message);
        });
});

export const AuthenticationController: Router = router;
