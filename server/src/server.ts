import express from 'express';
import { AccessController } from './controllers';

// Create new express application instance.
const app: express.Application = express();
const port: number = 3000;

app.use(express.json());
app.use('/access', AccessController);

app.listen(port, () => {
    // Success.
});


