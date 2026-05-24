import { Router } from "express";
import {
  createEventSeries,
  createEventSession,
  deleteEventSeries,
  deleteEventSession,
  getEventSeries,
  listEventSeries,
  updateEventSeries,
  updateEventSession,
} from "./event-series.controller";

const eventSeriesRouter = Router();

eventSeriesRouter.get("/", listEventSeries);
eventSeriesRouter.post("/", createEventSeries);
eventSeriesRouter.get("/:id", getEventSeries);
eventSeriesRouter.patch("/:id", updateEventSeries);
eventSeriesRouter.delete("/:id", deleteEventSeries);
eventSeriesRouter.post("/:id/sessions", createEventSession);
eventSeriesRouter.patch("/:id/sessions/:sessionId", updateEventSession);
eventSeriesRouter.delete("/:id/sessions/:sessionId", deleteEventSession);

export { eventSeriesRouter };
