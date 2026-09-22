import { pool } from '../../db';
import {
  PropertyFilterQuery,
  PaginatedPropertiesResult,
  PropertyDto,
  SortField,
} from './property.types';

const SORT_COLUMN_MAP: Record<SortField, string> = {
  price: 'price',
  createdAt: 'created_at',
  bedrooms: 'bedrooms',
  bathrooms: 'bathrooms',
};

export const mapPropertyRow = (row: any): PropertyDto => ({
  id: row.id,
  agentId: row.agent_id,
  title: row.title,
  description: row.description,
  propertyType: row.property_type,
  listingType: row.listing_type,
  price: Number(row.price),
  bedrooms: row.bedrooms !== null ? Number(row.bedrooms) : null,
  bathrooms: row.bathrooms !== null ? Number(row.bathrooms) : null,
  address: row.address,
  city: row.city,
  state: row.state,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getProperties = async (
  query: PropertyFilterQuery
): Promise<PaginatedPropertiesResult> => {
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

  if (query.propertyType) {
    params.push(query.propertyType);
    whereClauses.push(`property_type = $${params.length}`);
  }

  if (query.listingType) {
    params.push(query.listingType);
    whereClauses.push(`listing_type = $${params.length}`);
  }

  if (query.status) {
    params.push(query.status);
    whereClauses.push(`status = $${params.length}`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*)::int AS total FROM properties ${whereSql}`;
  const countResult = await pool.query(countSql, params);
  const total = countResult.rows[0].total;

  const sortColumn = SORT_COLUMN_MAP[query.sort];
  const sortOrder = query.order.toUpperCase(); // 'ASC' or 'DESC'

  const dataParams = [...params, query.limit, query.offset];
  const dataSql = `
    SELECT id, agent_id, title, description, property_type, listing_type, price,
           bedrooms, bathrooms, address, city, state, status, created_at, updated_at
    FROM properties
    ${whereSql}
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const dataResult = await pool.query(dataSql, dataParams);
  const data = dataResult.rows.map(mapPropertyRow);

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

export const getPropertyById = async (id: string): Promise<PropertyDto | null> => {
  const sql = `
    SELECT id, agent_id, title, description, property_type, listing_type, price,
           bedrooms, bathrooms, address, city, state, status, created_at, updated_at
    FROM properties
    WHERE id = $1
  `;

  const result = await pool.query(sql, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return mapPropertyRow(result.rows[0]);
};
