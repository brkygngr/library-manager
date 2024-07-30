import { z } from 'zod';

export const getUserParamsSchema = z.object(
  {
    id: z
      .string({ required_error: 'User id is required!' })
      .refine((val) => !isNaN(Number(val)), {
        message: 'User id must be a number!',
      })
      .transform((val) => Number(val))
      .refine((val) => Number.isInteger(val) && val > 0, {
        message: 'User id must be a positive integer!',
      }),
  },
  { invalid_type_error: 'Request params must include an id field!' },
);

export const postUserBodySchema = z.object(
  {
    name: z.string({ required_error: 'User name is required!', invalid_type_error: 'User name must be a string!' }),
  },
  { invalid_type_error: 'User must be an object with a name field!' },
);
