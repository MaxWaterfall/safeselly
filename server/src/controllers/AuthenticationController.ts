import {Request, Response, Router} from "express";
import {HttpRequestError} from "../helper/HttpRequestError";
import * as log from "./../helper/Logger";
import {allAuthenticatedRoutes} from "./../Server";
import * as AuthenticationService from "./../services/AuthenticationService";
import {isBodyValid} from "./Validator";

// Assign our router to the express router instance.
const router: Router = Router();

// Checks the request is authorized and valid.
router.use((req: Request, res: Response, next) => {
    // Check route exists.
    // let doesRouteExist = false;
    // for (const route of allAuthenticatedRoutes) {
    //     if (route === req.originalUrl) {
    //         doesRouteExist = true;
    //         break;
    //     }
    // }

    // if (!doesRouteExist) {
    //     res.sendStatus(404);
    //     return;
    // }

    if (!isBodyValid(req, res)) {
        return;
    }

    // Extract access_token, username, and device_token from the body.
    const accessToken = req.body.access_token;
    const username = req.body.username;
    const deviceToken = req.body.device_token;

    // Check access token is valid for this username and device token.
    AuthenticationService.isRequestAuthorised(username, deviceToken, accessToken)
        .then(() => {
            next();
        })
        .catch((err: HttpRequestError) => {
            res.status(err.status);
            res.send("Error: " + err.message);
        });
});

export const AuthenticationController: Router = router;
