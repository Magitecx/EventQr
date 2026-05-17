import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import morgan from "morgan";
import { corsOrigins } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found";
import { router } from "./routes";

export const app = express();

app.use(
  cors({
    origin: corsOrigins,
  }),
);
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api", router);
app.use(notFoundHandler);
app.use(errorHandler);
