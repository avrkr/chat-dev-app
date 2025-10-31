import express from 'express';
import { signup, login, logout, updateProfile } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js'; // ✅ Import added

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.put('/update-profile', protectRoute, updateProfile); // ✅ Now works
router.get('/check',protectRoute, (req, res) => {
  res.status(200).json({ message: 'You are authorized to access this route', user: req.user });
});

export default router;
