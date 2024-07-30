import z from 'zod';

export const getBookParamsSchema = z.object(
  {
    id: z
      .string({ required_error: 'Book id is required!' })
      .refine((val) => !isNaN(Number(val)), {
        message: 'Book id must be a number!',
      })
      .transform((val) => Number(val))
      .refine((val) => Number.isInteger(val) && val > 0, {
        message: 'Book id must be a positive integer!',
      }),
  },
  { invalid_type_error: 'Request params must include an id field!' },
);

export const postBookBodySchema = z.object(
  {
    name: z.string({ required_error: 'Book name is required!', invalid_type_error: 'Book name must be a string!' }),
  },
  { invalid_type_error: 'Book must be an object with a name field!' },
);
