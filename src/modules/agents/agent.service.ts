import { pool } from '../../db';
import {
  AgentFilterQuery,
  PaginatedAgentsResult,
  AgentDto,
  AgentSortField,
} from './agent.types';

const SORT_COLUMN_MAP: Record<AgentSortField, string> = {
  name: 'name',
  createdAt: 'created_at',
};

export const mapAgentRow = (row: any): AgentDto => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  agencyName: row.agency_name,
  city: row.city,
  state: row.state,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getAgents = async (
  query: AgentFilterQuery
): Promise<PaginatedAgentsResult> => {
  const whereClauses: string[] = [];
  const params: any[] = [];

  if (query.city) {
    params.push(query.city);
    whereClauses.push(`city = $${params.length}`);
  }

  if (query.state) {
    params.push(query.state);
    whereClauses.push(`state = $${params.length}`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*)::int AS total FROM agents ${whereSql}`;
  const countResult = await pool.query(countSql, params);
  const total = countResult.rows[0].total;

  const sortColumn = SORT_COLUMN_MAP[query.sort];
  const sortOrder = query.order.toUpperCase();

  const dataParams = [...params, query.limit, query.offset];
  const dataSql = `
    SELECT id, name, email, phone, agency_name, city, state, created_at, updated_at
    FROM agents
    ${whereSql}
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const dataResult = await pool.query(dataSql, dataParams);
  const data = dataResult.rows.map(mapAgentRow);

  const hasMore = query.offset + data.length < total;

  return {
    data,
    meta: {
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore,
      },
    },
  };
};

export const getAgentById = async (id: string): Promise<AgentDto | null> => {
  const sql = `
    SELECT id, name, email, phone, agency_name, city, state, created_at, updated_at
    FROM agents
    WHERE id = $1
  `;

  const result = await pool.query(sql, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return mapAgentRow(result.rows[0]);
};
