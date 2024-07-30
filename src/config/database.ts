import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Book } from '../book/model/Book';
import { BookScore } from '../book/model/BookScore';
import { User } from '../user/model/User';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [User, Book, BookScore],
});
