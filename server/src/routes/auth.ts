import express from "express";
import { body, validationResult } from "express-validator";
import * as authController from "../controllers/authController";

const router = express.Router();

router.post(
  "/register",
  [body("name").isString().notEmpty(), body("email").isEmail(), body("password").isLength({ min: 6 })],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      await authController.register(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").isString().notEmpty()],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      await authController.login(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.post("/google", async (req, res, next) => {
  try {
    await authController.googleLogin(req, res);
  } catch (err) {
    next(err);
  }
});

router.post("/facebook", async (req, res, next) => {
  try {
    await authController.facebookLogin(req, res);
  } catch (err) {
    next(err);
  }
});

router.post("/logout", authController.logout);

// Server-side OAuth redirect flows
router.get("/google/redirect", authController.googleRedirect);
router.get("/google/callback", authController.googleCallback);

router.get("/facebook/redirect", authController.facebookRedirect);
router.get("/facebook/callback", authController.facebookCallback);

export default router;
