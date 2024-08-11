import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "delete old files",
  { minutes: 1 },
  internal.files.deleteAllFiles,
);

export default crons;
