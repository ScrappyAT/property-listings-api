import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/errors';
import {
  ALLOWED_AGENT_SORT_FIELDS,
  AgentFilterQuery,
  AgentSortField,
  SortOrder,
} from './agent.types';
import * as agentService from './agent.service';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const listAgents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { city, state, sort, order, limit, offset } = req.query;

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

    // Validate city and state
    const parsedCity = typeof city === 'string' && city.trim() ? city.trim() : undefined;
    const parsedState = typeof state === 'string' && state.trim() ? state.trim() : undefined;

    // Validate sort field
    let parsedSort: AgentSortField = 'createdAt';
    if (sort !== undefined) {
      const sortStr = String(sort).trim();
      if (!ALLOWED_AGENT_SORT_FIELDS.includes(sortStr as AgentSortField)) {
        throw new AppError(
          400,
          'INVALID_QUERY',
          `Invalid sort field. Allowed values: ${ALLOWED_AGENT_SORT_FIELDS.join(', ')}.`
        );
      }
      parsedSort = sortStr as AgentSortField;
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

    const query: AgentFilterQuery = {
      city: parsedCity,
      state: parsedState,
      sort: parsedSort,
      order: parsedOrder,
      limit: parsedLimit,
      offset: parsedOffset,
    };

    const result = await agentService.getAgents(query);

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getAgentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id || '');

    if (!UUID_REGEX.test(id)) {
      throw new AppError(400, 'INVALID_ID', 'Invalid agent ID format. Must be a valid UUID.');
    }

    const agent = await agentService.getAgentById(id);

    if (!agent) {
      throw new AppError(404, 'NOT_FOUND', 'Agent not found.');
    }

    res.status(200).json({
      success: true,
      data: agent,
    });
  } catch (error) {
    next(error);
  }
};
