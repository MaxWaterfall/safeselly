import { Request, Response } from "express";

// Checks if the body is undefined then sends the correct response if so.
export function isBodyValid(req: Request, res: Response): boolean {
    if (req.body === undefined) {
        res.status(400);
        res.send("Error: No body given.");
        return false;
    }
    return true;
}