import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Book } from '../../book/model/Book';
import { BookScore } from '../../book/model/BookScore';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Book, (book) => book.borrowedBy)
  borrowedBooks: Book[];

  @ManyToMany(() => Book, (book) => book.returnedByUsers)
  @JoinTable()
  returnedBooks: Book[];

  @OneToMany(() => BookScore, (bookScore) => bookScore.user)
  scores: BookScore[];
}
