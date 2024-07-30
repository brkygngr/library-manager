import { z } from 'zod';

function getIDSchema(fieldName: string) {
  return z
    .string({ required_error: `${fieldName} is required!` })
    .refine((val) => !isNaN(Number(val)), {
      message: `${fieldName} must be a number!`,
    })
    .transform((val) => Number(val))
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: `${fieldName} must be a positive integer!`,
    });
}

// Schemas using the reusable idSchema
export const getUserParamsSchema = z.object(
  {
    id: getIDSchema('User id'),
  },
  { invalid_type_error: 'Request params must include an id field!' },
);

export const postUserBodySchema = z.object(
  {
    name: z.string({ required_error: 'User name is required!', invalid_type_error: 'User name must be a string!' }),
  },
  { invalid_type_error: 'User must be an object with a name field!' },
);

export const postBorrowBookParamsSchema = z.object({
  userId: getIDSchema('User id'),
  bookId: getIDSchema('Book id'),
});

export const postReturnBookParamsSchema = z.object({
  userId: getIDSchema('User id'),
  bookId: getIDSchema('Book id'),
});

export const postReturnBookBodySchema = z.object({
  score: z
    .number({ required_error: 'Score is required!' })
    .positive('Score must be between 1 and 10!')
    .max(10, 'Score must be between 1 and 10!'),
});

export type PostBorrowBookParams = z.infer<typeof postBorrowBookParamsSchema>;
export type PostReturnBookParams = z.infer<typeof postReturnBookParamsSchema>;
