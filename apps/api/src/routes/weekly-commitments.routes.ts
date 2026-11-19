import { Router } from "express";
import { listCurrentWeeklyCommitments } from "../services/weekly-commitments.service.js";

export const weeklyCommitmentRouter = Router();

weeklyCommitmentRouter.get("/current", async (req, res) => {
  const active = req.query.active;

  if (active !== undefined && active !== "true" && active !== "false") {
    res.status(400).json({ error: "active debe ser true o false" });
    return;
  }

  const onlyActive = active === "true";
  try {
    const commitments = await listCurrentWeeklyCommitments(onlyActive);

    res.status(200).json(commitments);
  } catch (error) {
    console.error("Error al listar compromisos semanales:", error);

    res.status(500).json({
      error: "No se pudieron obtener los compromisos semanales",
    });
  }
});
