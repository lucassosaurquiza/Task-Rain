import { Router } from "express";
import { validateCreateObjective } from "../validation/objective.js";
import {
  listObjectives,
  createObjective,
} from "../repositories/objectives.repository.js";

export const objectiveRouter = Router();

objectiveRouter.get("/", async (_req, res) => {
  try {
    const objectives = await listObjectives();

    res.json(objectives);
  } catch (error) {
    console.error("Error al listar objetivos:", error);

    res.status(500).json({
      error: "No se pudieron obtener los objetivos",
    });
  }
});

objectiveRouter.post("/", async (req, res) => {
  const validation = validateCreateObjective(req.body);

  if (!validation.ok) {
    res.status(400).json({
      error: validation.error,
    });
    return;
  }

  try {
    const objective = await createObjective(validation.data);

    res.status(201).json(objective);
  } catch (error) {
    console.error("Error al crear objetivo:", error);

    res.status(500).json({
      error: "No se pudo crear el objetivo",
    });
  }
});
