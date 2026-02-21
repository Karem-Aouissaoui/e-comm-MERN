import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { UserResponse } from './types/user-response.type';

/**
 * @Injectable() means:
 * "This class can be injected into other classes"
 */
@Injectable()
export class UsersService {
  /**
   * Inject the MongoDB model into the service
   */
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Convert Mongo document → safe API response
   */
  private toResponse(user: UserDocument): UserResponse {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      roles: user.roles,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * Create a new user
   * (temporary – will move to Auth module later)
   */
  async create(dto: CreateUserDto): Promise<UserResponse> {
    // Check if email already exists
    const existing = await this.userModel.findOne({
      email: dto.email.toLowerCase().trim(),
    });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    // Hash password securely
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Save user to DB
    const user = await this.userModel.create({
      name: dto.name.trim(),
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      roles: ['buyer'],
      buyerProfile: null,
      supplierProfile: null,
      isActive: true,
    });

    return this.toResponse(user);
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<UserResponse> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toResponse(user);
  }

  /**
   * Used by Auth module later (login)
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      email: email.toLowerCase().trim(),
    });
  }

  /**
   * List all users (admin use later)
   */
  async list(): Promise<UserResponse[]> {
    const users = await this.userModel.find().sort({ createdAt: -1 });
    return users.map((u) => this.toResponse(u));
  }

  /**
   * Update user profile
   */
  async update(id: string, dto: UpdateUserDto): Promise<UserResponse> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true, runValidators: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toResponse(user);
  }

  /**
   * Soft deactivate a user
   */
  async deactivate(id: string): Promise<UserResponse> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      roles: user.roles,
      isActive: user.isActive,
      buyerProfile: user.buyerProfile ?? null,
      supplierProfile: user.supplierProfile ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /** Re-enable a previously deactivated user. */
  async activate(id: string): Promise<UserResponse> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return this.toResponse(user);
  }

  /** Replace a user\'s roles array entirely. */
  async setRoles(id: string, roles: ('buyer' | 'supplier' | 'admin')[]): Promise<UserResponse> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { roles },
      { new: true, runValidators: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return this.toResponse(user);
  }

  /** Total number of users. */
  async count(): Promise<number> {
    return this.userModel.countDocuments();
  }

  /** Count users that have a specific role in their roles array. */
  async countByRole(role: string): Promise<number> {
    return this.userModel.countDocuments({ roles: role });
  }
  /**
   * Create a user when the password is already hashed.
   * This is used by AuthService during registration.
   *
   * WHY this exists:
   * - AuthService handles password hashing
   * - UsersService handles database persistence
   * - No service touches another service's internals
   */
  async createWithPasswordHash(params: {
    name: string;
    email: string;
    passwordHash: string;
    roles: ('buyer' | 'supplier' | 'admin')[];
    buyerProfile?: any | null;
    supplierProfile?: any | null;
  }) {
    const existing = await this.userModel.findOne({
      email: params.email.toLowerCase().trim(),
    });

    if (existing) {
      throw new ConflictException('Email already in use.');
    }

    const user = await this.userModel.create({
      name: params.name.trim(),
      email: params.email.toLowerCase().trim(),
      passwordHash: params.passwordHash,
      roles: params.roles,
      buyerProfile: params.buyerProfile ?? null,
      supplierProfile: params.supplierProfile ?? null,
      isActive: true,
    });

    return user;
  }
}
