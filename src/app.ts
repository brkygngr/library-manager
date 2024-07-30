import express from 'express';
import bookRoute from './route/bookRoute';
import userRoute from './route/userRoute';

const app = express();
app.use(express.json());

app.use('/users', userRoute);
app.use('/books', bookRoute);

export default app;
