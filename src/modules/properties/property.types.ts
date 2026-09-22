export const ALLOWED_PROPERTY_TYPES = ['apartment', 'house', 'duplex', 'land'] as const;
export const ALLOWED_LISTING_TYPES = ['sale', 'rent'] as const;
export const ALLOWED_STATUS_VALUES = ['available', 'sold', 'rented', 'unavailable'] as const;
export const ALLOWED_SORT_FIELDS = ['price', 'createdAt', 'bedrooms', 'bathrooms'] as const;
export const ALLOWED_SORT_ORDERS = ['asc', 'desc'] as const;

export type PropertyType = typeof ALLOWED_PROPERTY_TYPES[number];
export type ListingType = typeof ALLOWED_LISTING_TYPES[number];
export type PropertyStatus = typeof ALLOWED_STATUS_VALUES[number];
export type SortField = typeof ALLOWED_SORT_FIELDS[number];
export type SortOrder = typeof ALLOWED_SORT_ORDERS[number];

export interface PropertyFilterQuery {
  city?: string;
  state?: string;
  propertyType?: PropertyType;
  listingType?: ListingType;
  status?: PropertyStatus;
  sort: SortField;
  order: SortOrder;
  limit: number;
  offset: number;
}

export interface PropertyDto {
  id: string;
  agentId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  address: string;
  city: string;
  state: string;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPropertiesResult {
  data: PropertyDto[];
  meta: {
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}
