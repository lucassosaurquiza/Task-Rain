// Este estructura es para los tipos de periodos con los objetivos
export type ObjectivePeriod = "weekly" | "monthly" | "yearly";

// Esta estructura es para los estados de los objetivos
export type ObjectiveStatus = "in_progress" | "achieved";

// Tipo exportado
export type Objective = {
  id: string;
  title: string;
  period: ObjectivePeriod;
  status: ObjectiveStatus;
  successCriterion: string;
  motivation?: string;
  reward?: string;
  targetDate?: string;
  createdAt: string;
};
