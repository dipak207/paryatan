import express from "express";
import { body, validationResult } from "express-validator";
import { requireAuth } from "../middleware/authMiddleware";
import * as favoritesController from "../controllers/favoritesController";

const router = express.Router();

router.use(requireAuth);

router.get("/", favoritesController.getFavorites);

router.post(
  "/",
  [body("xid").isString().notEmpty(), body("destinationName").isString().notEmpty()],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      await favoritesController.addFavorite(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.delete("/:xid", favoritesController.removeFavorite);

export default router;
