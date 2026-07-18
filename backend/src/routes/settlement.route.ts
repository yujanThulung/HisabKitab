import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { createSettlement, getLatestSettlement, getSettlemets } from "../controllers/settlement.controller";

const router = Router();

router.post("/settlement/create", authenticate, createSettlement);
router.get("/settlement/latest", authenticate,getLatestSettlement);
router.get("/settlement",authenticate, getSettlemets);

export default router;