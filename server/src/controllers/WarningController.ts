import {Request, Response, Router} from "express";
import {HttpRequestError} from "./../helper/HttpRequestError";
import { IWarning, warningType } from "./../helper/WarningTypes";
import * as WarningService from "./../services/WarningService";

// Assign our router to the express router instance.
const router: Router = Router();

/**
 * Allows a user to submit a warning.
 */
router.post("/", (req: Request, res: Response) => {
    const warning: IWarning = req.body.warning;
    WarningService.submitWarning(req.get("username") as string, warning)
        .then(() => {
            res.sendStatus(200); // OK.
        })
        .catch((err: HttpRequestError) => {
            res.status(err.status);
            res.send(`Error: ${err.message}`);
        });
});

/**
 * Returns all warnings.
 */
router.get("/", (req: Request, res: Response) => {
    WarningService.getAllWarnings()
        .then((value) => {
            res.status(200);
            res.send(value);
        })
        .catch ((err: HttpRequestError) => {
            res.status(err.status);
            res.send(err.message);
        });
});

/**
 * Returns all warnings submitted after {id}.
 */
router.get("/:id/after", (req: Request, res: Response) => {
    WarningService.getWarningAfterId(req.params.id)
        .then((value) => {
            res.status(200);
            res.send(value);
        })
        .catch((err: HttpRequestError) => {
            res.status(err.status);
            res.send(err.message);
        });
});

/**
 * Updates warning with {id}, adds an upvote.
 */
router.post("/:id/upvote", (req: Request, res: Response) => {

});

/**
 * Updates warning with {id}, adds a downvote.
 */
router.post("/:id/downvote", (req: Request, res: Response) => {

});

export const WarningController: Router = router;
