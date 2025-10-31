import {ENV} from '../lib/env.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';



export const protectRoute = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

   
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    req.user = decoded;

    const user = User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found, authorization denied' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

