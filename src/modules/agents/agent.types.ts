export const ALLOWED_AGENT_SORT_FIELDS = ['name', 'createdAt'] as const;
export const ALLOWED_SORT_ORDERS = ['asc', 'desc'] as const;

export type AgentSortField = typeof ALLOWED_AGENT_SORT_FIELDS[number];
export type SortOrder = typeof ALLOWED_SORT_ORDERS[number];

export interface AgentFilterQuery {
  city?: string;
  state?: string;
  sort: AgentSortField;
  order: SortOrder;
  limit: number;
  offset: number;
}

export interface AgentDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  agencyName: string | null;
  city: string;
  state: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedAgentsResult {
  data: AgentDto[];
  meta: {
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}
