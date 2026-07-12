# @kingdom-of-bees/shared-types

Shared TypeScript type definitions for the Kingdom of Bees project.

## Installation

```bash
# In backend
npm install file:../packages/shared-types

# In frontend-web
npm install file:../packages/shared-types

# In admin-panel
npm install file:../packages/shared-types
```

## Usage

```typescript
import {
  User,
  Apiary,
  Hive,
  Alert,
  Inspection,
  ApiSuccessResponse,
  CreateApiaryRequest,
  UpdateHiveRequest,
} from '@kingdom-of-bees/shared-types';

// Use in your code
const user: User = {
  id: '123',
  email: 'user@example.com',
  // ...
};

// API Response typing
const response: ApiSuccessResponse<Apiary[]> = {
  success: true,
  message: 'Apiaries fetched successfully',
  data: apiaries,
};
```

## Available Types

### User & Authentication
- `User` - User profile
- `UserType` - User role enum
- `LoginRequest` - Login payload
- `RegisterRequest` - Registration payload
- `AuthResponse` - Authentication response

### Apiary
- `Apiary` - Apiary entity
- `ApiaryType` - Apiary type enum
- `CreateApiaryRequest` - Create apiary payload
- `UpdateApiaryRequest` - Update apiary payload

### Hive
- `Hive` - Hive entity
- `HiveType` - Hive type enum
- `HiveStatus` - Hive status enum
- `CreateHiveRequest` - Create hive payload
- `UpdateHiveRequest` - Update hive payload

### Alert
- `Alert` - Alert entity
- `AlertPriority` - Alert priority enum
- `AlertStatus` - Alert status enum
- `CreateAlertRequest` - Create alert payload
- `GetAlertsQuery` - Query parameters for alerts

### Inspection
- `Inspection` - Inspection entity
- `InspectionType` - Inspection type enum
- `InspectionFinding` - Inspection finding
- `InspectionAction` - Inspection action
- `CreateInspectionRequest` - Create inspection payload

### API Responses
- `ApiSuccessResponse<T>` - Success response wrapper
- `ApiErrorResponse` - Error response
- `ApiResponse<T>` - Union of success/error
- `PaginatedResponse<T>` - Paginated data response

## Development

```bash
# Build types
npm run build

# Watch for changes
npm run watch
```

## License

ISC
