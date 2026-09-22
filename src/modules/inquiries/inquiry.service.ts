import { pool } from '../../db';
import {
  InquiryFilterQuery,
  PaginatedInquiriesResult,
  InquiryDto,
  InquirySortField,
} from './inquiry.types';

const SORT_COLUMN_MAP: Record<InquirySortField, string> = {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

export const mapInquiryRow = (row: any): InquiryDto => ({
  id: row.id,
  propertyId: row.property_id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  message: row.message,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getInquiries = async (
  query: InquiryFilterQuery
): Promise<PaginatedInquiriesResult> => {
  const whereClauses: string[] = [];
  const params: any[] = [];

  if (query.propertyId) {
    params.push(query.propertyId);
    whereClauses.push(`property_id = $${params.length}`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*)::int AS total FROM inquiries ${whereSql}`;
  const countResult = await pool.query(countSql, params);
  const total = countResult.rows[0].total;

  const sortColumn = SORT_COLUMN_MAP[query.sort];
  const sortOrder = query.order.toUpperCase();

  const dataParams = [...params, query.limit, query.offset];
  const dataSql = `
    SELECT id, property_id, name, email, phone, message, created_at, updated_at
    FROM inquiries
    ${whereSql}
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const dataResult = await pool.query(dataSql, dataParams);
  const data = dataResult.rows.map(mapInquiryRow);

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

export const getInquiryById = async (id: string): Promise<InquiryDto | null> => {
  const sql = `
    SELECT id, property_id, name, email, phone, message, created_at, updated_at
    FROM inquiries
    WHERE id = $1
  `;

  const result = await pool.query(sql, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return mapInquiryRow(result.rows[0]);
};
