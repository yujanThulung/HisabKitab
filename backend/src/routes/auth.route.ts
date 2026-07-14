import {Router} from "express";

import { login, logout, me, refresh, register } from "../controllers/auth.controller";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";


const router = Router();

router.post("/auth/register",validate(registerSchema), register);
router.post("/auth/login", validate(loginSchema), login);
router.post("/auth/logout",authenticate, logout);
router.get("/auth/refresh-token", refresh);
router.get("/auth/me", authenticate, me)


export default router;