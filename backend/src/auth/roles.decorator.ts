import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from './roles.guard';
import { UserRole } from './auth.service';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
