import express from "express";
import { taskRouter } from "./routes/tasks.routes.js";
import { objectiveRouter } from "./routes/objectives.routes.js";
import { weeklyCommitmentRouter } from "./routes/weekly-commitments.routes.js";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/tasks", taskRouter);
app.use("/objectives", objectiveRouter);
app.use("/weekly-commitments", weeklyCommitmentRouter);
