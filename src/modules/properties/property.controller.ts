import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/errors';
import {
  ALLOWED_PROPERTY_TYPES,
  ALLOWED_LISTING_TYPES,
  ALLOWED_STATUS_VALUES,
  ALLOWED_SORT_FIELDS,
  PropertyFilterQuery,
  PropertyType,
  ListingType,
  PropertyStatus,
  SortField,
  SortOrder,
} from './property.types';
import * as propertyService from './property.service';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const listProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { city, state, propertyType, listingType, status, sort, order, limit, offset } = req.query;

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

    // Validate city and state strings
    const parsedCity = typeof city === 'string' && city.trim() ? city.trim() : undefined;
    const parsedState = typeof state === 'string' && state.trim() ? state.trim() : undefined;

    // Validate propertyType
    let parsedPropertyType: PropertyType | undefined;
    if (propertyType !== undefined) {
      const pType = String(propertyType).trim();
      if (!ALLOWED_PROPERTY_TYPES.includes(pType as PropertyType)) {
        throw new AppError(
          400,
          'INVALID_QUERY',
          `Invalid propertyType. Allowed values: ${ALLOWED_PROPERTY_TYPES.join(', ')}.`
        );
      }
      parsedPropertyType = pType as PropertyType;
    }

    // Validate listingType
    let parsedListingType: ListingType | undefined;
    if (listingType !== undefined) {
      const lType = String(listingType).trim();
      if (!ALLOWED_LISTING_TYPES.includes(lType as ListingType)) {
        throw new AppError(
          400,
          'INVALID_QUERY',
          `Invalid listingType. Allowed values: ${ALLOWED_LISTING_TYPES.join(', ')}.`
        );
      }
      parsedListingType = lType as ListingType;
    }

    // Validate status
    let parsedStatus: PropertyStatus | undefined;
    if (status !== undefined) {
      const sVal = String(status).trim();
      if (!ALLOWED_STATUS_VALUES.includes(sVal as PropertyStatus)) {
        throw new AppError(
          400,
          'INVALID_QUERY',
          `Invalid status. Allowed values: ${ALLOWED_STATUS_VALUES.join(', ')}.`
        );
      }
      parsedStatus = sVal as PropertyStatus;
    }

    // Validate sort field
    let parsedSort: SortField = 'createdAt';
    if (sort !== undefined) {
      const sortStr = String(sort).trim();
      if (!ALLOWED_SORT_FIELDS.includes(sortStr as SortField)) {
        throw new AppError(
          400,
          'INVALID_QUERY',
          `Invalid sort field. Allowed values: ${ALLOWED_SORT_FIELDS.join(', ')}.`
        );
      }
      parsedSort = sortStr as SortField;
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

    const query: PropertyFilterQuery = {
      city: parsedCity,
      state: parsedState,
      propertyType: parsedPropertyType,
      listingType: parsedListingType,
      status: parsedStatus,
      sort: parsedSort,
      order: parsedOrder,
      limit: parsedLimit,
      offset: parsedOffset,
    };

    const result = await propertyService.getProperties(query);

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getPropertyById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id || '');

    if (!UUID_REGEX.test(id)) {
      throw new AppError(400, 'INVALID_ID', 'Invalid property ID format. Must be a valid UUID.');
    }

    const property = await propertyService.getPropertyById(id);

    if (!property) {
      throw new AppError(404, 'NOT_FOUND', 'Property not found.');
    }

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};
