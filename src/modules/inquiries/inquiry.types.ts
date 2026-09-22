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
