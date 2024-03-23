import { SetMetadata } from '@nestjs/common';

export const RequireLogin = () => SetMetadata('requireLogin', true);
