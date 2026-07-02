import express from "express";
import * as destinationController from "../controllers/destinationController";

const router = express.Router();

router.get("/search", destinationController.search);
router.get("/destination/:xid", destinationController.details);

export default router;
