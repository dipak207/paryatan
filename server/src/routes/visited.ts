import express from "express";
import { body, validationResult } from "express-validator";
import { requireAuth } from "../middleware/authMiddleware";
import * as visitedController from "../controllers/visitedController";

const router = express.Router();

router.use(requireAuth);

router.get("/", visitedController.getVisited);

router.post(
  "/",
  [
    body("xid").isString().notEmpty(),
    body("destinationName").isString().notEmpty(),
    body("visitedDate").optional().isISO8601(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      await visitedController.addVisited(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.delete("/:xid", visitedController.removeVisited);

export default router;
