import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Book } from '../../book/model/Book';

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
}
