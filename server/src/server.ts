import express from 'express';
import {TestController} from './controllers';

// Create new express application instance.
const app: express.Application = express();
const port: number = 3000;

app.use('/test', TestController);

app.listen(port, () => {
    // Success.
});