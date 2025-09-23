import { fetchAllUsers } from '#controllers/users.controller.js';
import express from 'express';

const router = express.Router();

router.get('/', fetchAllUsers);
router.get('/:id', (req, res) => res.send('GET /Users/:id'));
router.put('/:id', (req, res) => res.send('PUT /Users/:id'));
router.delete('/:id', (req, res) => res.send('DELETE /Users/:id'));

export default router;



