/**
 * Shared types for the Idjwi Electrification App
 */

export interface BudgetLine {
  id: string;
  category: "Personnel" | "Logistique" | "Équipements" | "Fonctionnement" | "Sensibilisation" | "Suivi";
  designation: string;
  quantity: number;
  unit: string;
  unitPriceUSD: number;
  durationMonths: number;
}

export interface GanttTask {
  id: string;
  number: number;
  title: string;
  subTasks: string[];
  startMonth: number;
  durationMonths: number;
  progress: number; // 0 to 100
  costEstimateUSD: number;
  responsible: string;
}

export interface LogFrameRow {
  id: string;
  level: "Objectif Général" | "Objectifs Spécifiques" | "Résultats Attendus" | "Activités Principales";
  logicOfIntervention: string;
  indicators: string[];
  verificationSources: string[];
  assumptionsAndRisks: string[];
  details?: string;
}

export interface SimulationParams {
  householdsCount: number;
  dailyConsumptionKWh: number; // Consumption per household per day (default 1.2 kWh)
  hasClinics: boolean;
  hasSchools: boolean;
  hasCoffeeCoops: boolean;
  solarCapacityKWp: number;
  batteryCapacityKWh: number;
  biomassCapacityKW: number;
}

export interface Message {
  role: "user" | "model";
  text: string;
  timestamp: string;
  sources?: Array<{ title: string; url: string }>;
  isError?: boolean;
}
