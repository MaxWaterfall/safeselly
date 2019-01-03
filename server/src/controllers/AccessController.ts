import {Router, Request, Response} from 'express';
import {AccessService} from './../services/accessService';

// Assign our router to the express router instance.
const router: Router = Router();

// 1. Client requests a device id.
// 2. Client requests verification email.
// 3. Client requests access token.

// Returns a device id.
router.post('/device', (req: Request, res: Response) => {
    if (req.body == undefined) {
        res.status(400);
        res.send("Error: No body given.");
        return;
    }

    let ret = AccessService.getDeviceId(req.body.username);
    if (ret.error) {
        res.status(400); // Bad Request.
        res.send(`Error: ${ret.errorMessage}`);
    } else {
        res.status(200); // OK.
        res.send({
            deviceId: ret.value
        })
    }
});

// Sends a verification email to the user.
router.post('/email', (req: Request, res: Response) => {
    let ret = AccessService.sendVerificationEmail(req.body.username, req.body.deviceId);
    if (ret.error) {
        res.status(400); // Bad Request.
        res.send(`Error: ${ret.errorMessage}`)
    } else {
        res.status(200); // OK.
        res.send(ret.value);
    }
});

// Returns an access token.
router.post('/token', (req: Request, res: Response) => {
    let ret = AccessService.getAccessToken(req.body.username, req.body.deviceId);
    if(ret.error) {
        res.status(400);
        res.send(`Error: ${ret.errorMessage}`);
    } else {
        res.status(400);
        res.send({
            accessToken: ret.value
        });
    }
});

export const AccessController: Router = router;