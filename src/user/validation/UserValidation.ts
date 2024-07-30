import { z } from 'zod';

export const postUserBodySchema = z.object(
  {
    name: z.string({ required_error: 'User name is required!', invalid_type_error: 'User name must be a string!' }),
  },
  { invalid_type_error: 'User must be an object with a name field!' },
);
