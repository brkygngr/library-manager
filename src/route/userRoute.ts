import express from 'express';
import { getUsers } from '../controller/UserController';

const router = express.Router();

router.get('/', getUsers);

export default router;
