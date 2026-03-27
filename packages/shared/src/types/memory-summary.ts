import type {
  MemorySummaryActorType,
  MemorySummaryEntityType,
  MemorySummaryStatus,
  MemorySummaryType,
} from "../constants.js";

export interface MemorySummary {
  id: string;
  companyId: string;
  entityType: MemorySummaryEntityType;
  entityId: string;
  summaryType: MemorySummaryType;
  title: string;
  body: string;
  structuredData: Record<string, unknown> | null;
  sourceRunId: string | null;
  createdByType: MemorySummaryActorType;
  createdById: string;
  status: MemorySummaryStatus;
  supersedesSummaryId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
