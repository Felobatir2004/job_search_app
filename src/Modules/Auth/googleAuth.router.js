import express from 'express';
import passport from 'passport';

const router = express.Router();

// Google Sign-Up route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback route
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Google Sign-Up successful!',
      user: req.user,
    });
  }
);




// Initiate Google Login
router.get(
    '/google/login',
    (req, res, next) => {
      console.log('Google login route hit'); // Debug log
      next();
    },
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

// Google Callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT tokens
    const accessToken = generateToken({
      payload: { id: req.user._id },
      signature:
        req.user.role === 'User'
          ? process.env.USER_ACCESS_TOKEN
          : process.env.ADMIN_ACCESS_TOKEN,
    });

    const refreshToken = generateToken({
      payload: { id: req.user._id },
      signature:
        req.user.role === 'User'
          ? process.env.USER_REFRESH_TOKEN
          : process.env.ADMIN_REFRESH_TOKEN,
    });

    // Send tokens to client
    res.status(200).json({
      success: true,
      message: 'Google login successful!',
      tokens: {
        accessToken,
        refreshToken,
      },
      user: req.user,
    });
  }
);


export default router;
