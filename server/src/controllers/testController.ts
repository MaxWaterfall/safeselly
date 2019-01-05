import {Router, Request, Response} from 'express';

// Assign our router to the express router instance.
const router: Router = Router();

router.get('/', (res: Response) => {
    res.send('Hello World!');
});

router.get('/:name', (req: Request, res: Response) => {
    let name: string = req.params.name;
    let response: string = `Hello ${name}`;
    res.send(response);
});

export const TestController: Router = router;