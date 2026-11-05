import express from "express";
import { taskRouter } from "./routes/tasks.routes.js";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/tasks", taskRouter);
