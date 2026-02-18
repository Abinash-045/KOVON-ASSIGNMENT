import dotenv from 'dotenv';
import express from 'express';
import { json } from 'express';
import { router as apiRouter } from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { connectDb } from './config/db';

dotenv.config();
const app = express();

app.use(json());

app.use('/api', apiRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'kovon';

async function start() {
  try {
    await connectDb(MONGO_URI, DB_NAME);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

export { app, start };


