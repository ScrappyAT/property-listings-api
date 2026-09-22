export const ALLOWED_IMAGE_SORT_FIELDS = ['createdAt'] as const;
export const ALLOWED_SORT_ORDERS = ['asc', 'desc'] as const;

export type ImageSortField = typeof ALLOWED_IMAGE_SORT_FIELDS[number];
export type SortOrder = typeof ALLOWED_SORT_ORDERS[number];

export interface ImageFilterQuery {
  propertyId?: string;
  isPrimary?: boolean;
  sort: ImageSortField;
  order: SortOrder;
  limit: number;
  offset: number;
}

export interface ImageDto {
  id: string;
  propertyId: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  createdAt: string;
}

export interface PaginatedImagesResult {
  data: ImageDto[];
  meta: {
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}
