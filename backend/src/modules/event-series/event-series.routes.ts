import { Router } from "express";
import {
  createEventSeries,
  createEventSession,
  getEventSeries,
  listEventSeries,
} from "./event-series.controller";

const eventSeriesRouter = Router();

eventSeriesRouter.get("/", listEventSeries);
eventSeriesRouter.post("/", createEventSeries);
eventSeriesRouter.get("/:id", getEventSeries);
eventSeriesRouter.post("/:id/sessions", createEventSession);

export { eventSeriesRouter };
