import {Request, Response, Router} from "express";

// Assign our router to the express router instance.
const router: Router = Router();

router.get("/", (res: Response) => {
    res.send("Hello World!");
});

router.get("/:name", (req: Request, res: Response) => {
    const name: string = req.params.name;
    const response: string = `Hello ${name}`;
    res.send(response);
});

export const TestController: Router = router;
