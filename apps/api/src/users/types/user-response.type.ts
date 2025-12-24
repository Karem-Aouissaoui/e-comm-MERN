import { UserRole } from '../schemas/user.schema';

/**
 * This type defines what we SEND BACK to clients
 *
 * Notice:
 * ❌ no passwordHash
 * ❌ no internal Mongo fields
 */
export type UserResponse = {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  isActive: boolean;
  buyerProfile?: {
    companyName?: string;
    country?: string;
    phone?: string;
  } | null;
  supplierProfile?: {
    companyName?: string;
    country?: string;
    city?: string;
    phone?: string;
    website?: string;
    isVerified?: boolean;
  } | null;
  createdAt: string;
  updatedAt: string;
};
