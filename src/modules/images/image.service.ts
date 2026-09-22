import { pool } from '../../db';
import {
  ImageFilterQuery,
  PaginatedImagesResult,
  ImageDto,
  ImageSortField,
} from './image.types';

const SORT_COLUMN_MAP: Record<ImageSortField, string> = {
  createdAt: 'created_at',
};

export const mapImageRow = (row: any): ImageDto => ({
  id: row.id,
  propertyId: row.property_id,
  url: row.url,
  altText: row.alt_text,
  isPrimary: Boolean(row.is_primary),
  createdAt: row.created_at,
});

export const getImages = async (
  query: ImageFilterQuery
): Promise<PaginatedImagesResult> => {
  const whereClauses: string[] = [];
  const params: any[] = [];

  if (query.propertyId) {
    params.push(query.propertyId);
    whereClauses.push(`property_id = $${params.length}`);
  }

  if (query.isPrimary !== undefined) {
    params.push(query.isPrimary);
    whereClauses.push(`is_primary = $${params.length}`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*)::int AS total FROM images ${whereSql}`;
  const countResult = await pool.query(countSql, params);
  const total = countResult.rows[0].total;

  const sortColumn = SORT_COLUMN_MAP[query.sort];
  const sortOrder = query.order.toUpperCase();

  const dataParams = [...params, query.limit, query.offset];
  const dataSql = `
    SELECT id, property_id, url, alt_text, is_primary, created_at
    FROM images
    ${whereSql}
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const dataResult = await pool.query(dataSql, dataParams);
  const data = dataResult.rows.map(mapImageRow);

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

export const getImageById = async (id: string): Promise<ImageDto | null> => {
  const sql = `
    SELECT id, property_id, url, alt_text, is_primary, created_at
    FROM images
    WHERE id = $1
  `;

  const result = await pool.query(sql, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return mapImageRow(result.rows[0]);
};
