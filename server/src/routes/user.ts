import express from "express";
import { body, validationResult } from "express-validator";
import { requireAuth } from "../middleware/authMiddleware";
import * as userController from "../controllers/userController";

const router = express.Router();

router.use(requireAuth);

router.get("/profile", userController.getProfile);

router.put(
  "/profile",
  [body("name").optional().isString().notEmpty()],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      await userController.updateProfile(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/change-password",
  [body("oldPassword").isString(), body("newPassword").isLength({ min: 6 })],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      await userController.changePassword(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.delete("/delete-account", userController.deleteAccount);

export default router;
