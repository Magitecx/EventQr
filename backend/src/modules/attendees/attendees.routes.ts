import { Router } from "express";
import {
  createAttendee,
  deleteAttendee,
  getAttendee,
  listAttendees,
  updateAttendee,
} from "./attendees.controller";

const attendeesRouter = Router();

attendeesRouter.get("/", listAttendees);
attendeesRouter.post("/", createAttendee);
attendeesRouter.get("/:id", getAttendee);
attendeesRouter.patch("/:id", updateAttendee);
attendeesRouter.delete("/:id", deleteAttendee);

export { attendeesRouter };
