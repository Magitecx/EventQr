import { Router } from "express";
import { checkIn } from "./scan.controller";

const scanRouter = Router();

scanRouter.post("/check-in", checkIn);

export { scanRouter };
