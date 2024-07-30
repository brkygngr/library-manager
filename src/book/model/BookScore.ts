import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/model/User';
import { Book } from './Book';

@Entity()
export class BookScore {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  value: number;

  @ManyToOne(() => User, (user) => user.scores)
  user: User;

  @ManyToOne(() => Book, (book) => book.scores)
  book: Book;
}
