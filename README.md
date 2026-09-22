# Property Listings API

A REST API that provides realistic property listing data for the Nigerian property market.

## Resource Design
### Agent

Represents an individual responsible for listing properties on the platform.

| Field | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique generated identifier for the agent |
| name | String | Yes | Full name of the agent |
| email | String | Yes | Contact email address |
| phone | String | Yes | Contact phone number |
| agencyName | String | No | Name of the agency the agent represents |
| city | String | Yes | Primary city where the agent operates |
| state | String | Yes | Primary state where the agent operates |
| createdAt | DateTime | Yes | Date and time the agent record was created |
| updatedAt | DateTime | Yes | Date and time the agent record was last updated |

**Relationship:** One agent can list many properties.
### Property

Represents a property listed by an agent for sale or rent.

| Field | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique generated identifier for the property |
| agentId | UUID | Yes | Identifier of the agent who listed the property |
| title | String | Yes | Title of the property listing |
| description | String | Yes | Detailed description of the property |
| propertyType | Enum | Yes | Type of property such as apartment, house, duplex, or land |
| listingType | Enum | Yes | Indicates whether the property is for sale or rent |
| price | Integer | Yes | Listing price of the property |
| bedrooms | Integer | No | Number of bedrooms |
| bathrooms | Integer | No | Number of bathrooms |
| address | String | Yes | Street address or location of the property |
| city | String | Yes | City where the property is located |
| state | String | Yes | State where the property is located |
| status | Enum | Yes | Current listing status: available, sold, rented, or unavailable |
| createdAt | DateTime | Yes | Date and time the property record was created |
| updatedAt | DateTime | Yes | Date and time the property record was last updated |

**Relationship:** Each property belongs to one agent. One agent can list many properties.
### Image

Represents an image associated with a property listing.

| Field | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique generated identifier for the image |
| propertyId | UUID | Yes | Identifier of the property the image belongs to |
| url | String | Yes | URL where the property image is stored |
| altText | String | No | Alternative text describing the image |
| isPrimary | Boolean | Yes | Indicates whether this is the primary image for the property |
| createdAt | DateTime | Yes | Date and time the image record was created |

**Relationship:** Each image belongs to one property. One property can have many images.
### Inquiry

Represents an expression of interest submitted for a property.

| Field | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique generated identifier for the inquiry |
| propertyId | UUID | Yes | Identifier of the property the inquiry relates to |
| name | String | Yes | Name of the person making the inquiry |
| email | String | Yes | Email address of the person making the inquiry |
| phone | String | No | Contact phone number |
| message | String | Yes | Message sent regarding the property |
| createdAt | DateTime | Yes | Date and time the inquiry was submitted |
| updatedAt | DateTime | Yes | Date and time the inquiry was last updated |

**Relationship:** Each inquiry belongs to one property. One property can receive many inquiries.