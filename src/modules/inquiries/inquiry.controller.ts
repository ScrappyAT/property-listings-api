import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/errors';
import {
  ALLOWED_INQUIRY_SORT_FIELDS,
  InquiryFilterQuery,
  InquirySortField,
  SortOrder,
} from './inquiry.types';
import * as inquiryService from './inquiry.service';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const listInquiries = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { propertyId, sort, order, limit, offset } = req.query;

    // Validate and parse limit
    let parsedLimit = 20;
    if (limit !== undefined) {
      const limitStr = String(limit).trim();
      if (!/^\d+$/.test(limitStr)) {
        throw new AppError(400, 'INVALID_QUERY', 'limit must be a positive integer.');
      }
      const val = parseInt(limitStr, 10);
      if (val <= 0) {
        throw new AppError(400, 'INVALID_QUERY', 'limit must be a positive integer.');
      }
      parsedLimit = val > 100 ? 100 : val;
    }

    // Validate and parse offset
    let parsedOffset = 0;
    if (offset !== undefined) {
      const offsetStr = String(offset).trim();
      if (!/^\d+$/.test(offsetStr)) {
        throw new AppError(400, 'INVALID_QUERY', 'offset must be a non-negative integer.');
      }
      parsedOffset = parseInt(offsetStr, 10);
    }

    // Validate propertyId filter
    let parsedPropertyId: string | undefined;
    if (propertyId !== undefined) {
      const pIdStr = String(propertyId).trim();
      if (!UUID_REGEX.test(pIdStr)) {
        throw new AppError(400, 'INVALID_QUERY', 'Invalid propertyId filter. Must be a valid UUID.');
      }
      parsedPropertyId = pIdStr;
    }

    // Validate sort field
    let parsedSort: InquirySortField = 'createdAt';
    if (sort !== undefined) {
      const sortStr = String(sort).trim();
      if (!ALLOWED_INQUIRY_SORT_FIELDS.includes(sortStr as InquirySortField)) {
        throw new AppError(
          400,
          'INVALID_QUERY',
          `Invalid sort field. Allowed values: ${ALLOWED_INQUIRY_SORT_FIELDS.join(', ')}.`
        );
      }
      parsedSort = sortStr as InquirySortField;
    }

    // Validate sort order
    let parsedOrder: SortOrder = 'desc';
    if (order !== undefined) {
      const orderStr = String(order).trim().toLowerCase();
      if (orderStr !== 'asc' && orderStr !== 'desc') {
        throw new AppError(400, 'INVALID_QUERY', 'Invalid sort order. Allowed values: asc, desc.');
      }
      parsedOrder = orderStr as SortOrder;
    }

    const query: InquiryFilterQuery = {
      propertyId: parsedPropertyId,
      sort: parsedSort,
      order: parsedOrder,
      limit: parsedLimit,
      offset: parsedOffset,
    };

    const result = await inquiryService.getInquiries(query);

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getInquiryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id || '');

    if (!UUID_REGEX.test(id)) {
      throw new AppError(400, 'INVALID_ID', 'Invalid inquiry ID format. Must be a valid UUID.');
    }

    const inquiry = await inquiryService.getInquiryById(id);

    if (!inquiry) {
      throw new AppError(404, 'NOT_FOUND', 'Inquiry not found.');
    }

    res.status(200).json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};
