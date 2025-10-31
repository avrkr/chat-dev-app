import express from 'express';
import { signup } from '../controllers/auth.controller.js';


const router = express.Router();

router.post('/signup', signup);


router.get('/register', (req, res) => {
  res.send('Register Page');
});

router.get('/logout', (req, res) => {
  res.send('Logging out...');
});

export default router;