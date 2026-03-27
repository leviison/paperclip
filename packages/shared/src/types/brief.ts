import type { BriefSource, BriefStatus } from "../constants.js";

export interface BriefConstraints {
  time_horizon?: string | null;
  must_not?: string[];
  must_do?: string[];
  dependencies?: string[];
  artifacts?: string[];
  [key: string]: unknown;
}

export interface BriefSummary {
  id: string;
  companyId: string;
  issueId: string;
  assignedAgentId: string | null;
  createdByAgentId: string | null;
  createdByUserId: string | null;
  title: string;
  status: BriefStatus;
  source: BriefSource;
  version: string;
  supersedesBriefId: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export interface Brief extends BriefSummary {
  body: string;
  constraints: BriefConstraints | null;
  expectedOutput: string | null;
}
