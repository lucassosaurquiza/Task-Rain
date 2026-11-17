import { Router } from "express";
import { listCurrentWeeklyCommitments } from "../services/weekly-commitments.service.js";

export const weeklyCommitmentRouter = Router();

weeklyCommitmentRouter.get("/current", async (_req, res) => {
  try {
    const commitments = await listCurrentWeeklyCommitments();

    res.status(200).json(commitments);
  } catch (error) {
    console.error("Error al listar compromisos semanales:", error);

    res.status(500).json({
      error: "No se pudieron obtener los compromisos semanales",
    });
  }
});
