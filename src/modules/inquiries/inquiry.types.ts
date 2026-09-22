import { z } from 'zod';

export const ALLOWED_INQUIRY_SORT_FIELDS = ['createdAt', 'updatedAt'] as const;
export const ALLOWED_SORT_ORDERS = ['asc', 'desc'] as const;

export type InquirySortField = typeof ALLOWED_INQUIRY_SORT_FIELDS[number];
export type SortOrder = typeof ALLOWED_SORT_ORDERS[number];

export interface InquiryFilterQuery {
  propertyId?: string;
  sort: InquirySortField;
  order: SortOrder;
  limit: number;
  offset: number;
}

export interface InquiryDto {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedInquiriesResult {
  data: InquiryDto[];
  meta: {
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

export const createInquirySchema = z
  .object({
    propertyId: z
      .string()
      .uuid({ message: 'Invalid propertyId. Must be a valid UUID.' }),
    name: z
      .string()
      .trim()
      .min(1, { message: 'Name cannot be empty.' })
      .max(255, { message: 'Name cannot exceed 255 characters.' }),
    email: z
      .string()
      .trim()
      .email({ message: 'Invalid email format.' })
      .max(255, { message: 'Email cannot exceed 255 characters.' }),
    phone: z
      .string()
      .trim()
      .min(1, { message: 'Phone cannot be an empty string.' })
      .max(50, { message: 'Phone cannot exceed 50 characters.' })
      .optional(),
    message: z
      .string()
      .trim()
      .min(1, { message: 'Message cannot be empty.' }),
  })
  .strict();

export type CreateInquiryDto = z.infer<typeof createInquirySchema>;
