import express from 'express';
import userRoute from './route/userRoute';

const app = express();

app.use('/users', userRoute);

export default app;
