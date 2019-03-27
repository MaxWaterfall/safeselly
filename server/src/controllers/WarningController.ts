import {Request, Response, Router} from "express";
import { ISubmissionWarning } from "../../../shared/Warnings";
import {HttpRequestError} from "./../helper/HttpRequestError";
import * as log from "./../helper/Logger";
import * as WarningService from "./../services/WarningService";

// Assign our router to the express router instance.
const router: Router = Router();

/**
 * Allows a user to submit a warning.
 */
router.post("/", (req: Request, res: Response) => {
    const warning: ISubmissionWarning = req.body.warning;
    WarningService.submitWarning(req.get("username") as string, warning)
        .then(() => {
            res.sendStatus(200); // OK.
        })
        .catch((err: HttpRequestError) => {
            res.status(err.status);
            res.send(err.message);
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
 * Returns all warnings that have a WarningDateTime within the last x hours.
 */
router.get("/filter/:hours", (req: Request, res: Response) => {
    WarningService.getWarningsFrom(req.params.hours)
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
 * Returns all warnings that are relevant to the user making the request.
 * Can still be filtered using hours, but recommend to use 72 (3 days).
 */
router.get("/filter/:hours/relevant", (req: Request, res: Response) => {
    WarningService.getRelevantWarningsFrom(req.get("username") as string, req.params.hours)
        .then((value) => {
            res.status(200);
            res.send(value);
        })
        .catch((err: HttpRequestError) => {
            log.error(err.message);
            res.status(err.status);
            res.send(err.message);
        });
});

/**
 * Returns information for warning with {id}.
 * This includes specific information only relevant to the user who made the request.
 */
router.get("/:id", (req: Request, res: Response) => {
    WarningService.getWarning(req.get("username") as string, req.params.id)
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
    WarningService.upvoteWarning(req.params.id, req.get("username") as string)
        .then(() => {
            res.sendStatus(200);
        })
        .catch((err: HttpRequestError) => {
            res.status(err.status);
            res.send(err.message);
        });
});

/**
 * Updates warning with {id}, adds a downvote.
 */
router.post("/:id/downvote", (req: Request, res: Response) => {
    WarningService.downvoteWarning(req.params.id, req.get("username") as string)
        .then(() => {
            res.sendStatus(200);
        })
        .catch((err: HttpRequestError) => {
            res.status(err.status);
            res.send(err.message);
        });
});

export const WarningController: Router = router;
