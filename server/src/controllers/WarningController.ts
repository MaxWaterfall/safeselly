import {Request, Response, Router} from "express";
import {HttpRequestError} from "./../helper/HttpRequestError";
import * as WarningService from "./../services/WarningService";
import * as Validator from "./Validator";

// Assign our router to the express router instance.
const router: Router = Router();

// Allows a user to submit a warning.
router.post("/", (req: Request, res: Response) => {
    const warning: WarningService.IWarning = {
        peopleDescription: req.body.warning.people_description,
        warningDescription: req.body.warning.warning_description,
        location: {
            lat: req.body.warning.location.lat,
            long: req.body.warning.location.long,
        },
    };

    WarningService.submitWarning(req.body.username, warning)
        .then(() => {
            res.sendStatus(200); // OK.
        })
        .catch((err: HttpRequestError) => {
            res.status(err.status);
            res.send(`Error: ${err.message}`);
        });
});

export const WarningController: Router = router;