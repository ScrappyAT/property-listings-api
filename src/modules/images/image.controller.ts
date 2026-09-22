import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/errors';
import {
  ALLOWED_IMAGE_SORT_FIELDS,
  ImageFilterQuery,
  ImageSortField,
  SortOrder,
} from './image.types';
import * as imageService from './image.service';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const listImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { propertyId, isPrimary, sort, order, limit, offset } = req.query;

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

    // Validate isPrimary boolean filter
    let parsedIsPrimary: boolean | undefined;
    if (isPrimary !== undefined) {
      const isPrimaryStr = String(isPrimary).trim().toLowerCase();
      if (isPrimaryStr !== 'true' && isPrimaryStr !== 'false') {
        throw new AppError(400, 'INVALID_QUERY', 'Invalid isPrimary filter. Must be "true" or "false".');
      }
      parsedIsPrimary = isPrimaryStr === 'true';
    }

    // Validate sort field
    let parsedSort: ImageSortField = 'createdAt';
    if (sort !== undefined) {
      const sortStr = String(sort).trim();
      if (!ALLOWED_IMAGE_SORT_FIELDS.includes(sortStr as ImageSortField)) {
        throw new AppError(
          400,
          'INVALID_QUERY',
          `Invalid sort field. Allowed values: ${ALLOWED_IMAGE_SORT_FIELDS.join(', ')}.`
        );
      }
      parsedSort = sortStr as ImageSortField;
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

    const query: ImageFilterQuery = {
      propertyId: parsedPropertyId,
      isPrimary: parsedIsPrimary,
      sort: parsedSort,
      order: parsedOrder,
      limit: parsedLimit,
      offset: parsedOffset,
    };

    const result = await imageService.getImages(query);

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getImageById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id || '');

    if (!UUID_REGEX.test(id)) {
      throw new AppError(400, 'INVALID_ID', 'Invalid image ID format. Must be a valid UUID.');
    }

    const image = await imageService.getImageById(id);

    if (!image) {
      throw new AppError(404, 'NOT_FOUND', 'Image not found.');
    }

    res.status(200).json({
      success: true,
      data: image,
    });
  } catch (error) {
    next(error);
  }
};
