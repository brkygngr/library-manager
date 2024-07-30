import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/model/User';
import { BookScore } from './BookScore';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.borrowedBooks, { nullable: true })
  borrowedBy: User | null;

  @ManyToMany(() => User, (user) => user.returnedBooks)
  returnedByUsers: User[];

  @OneToMany(() => BookScore, (bookScore) => bookScore.book)
  scores: BookScore[];

  isBorrowed(): boolean {
    return typeof this.borrowedBy?.id === 'number';
  }

  isBorrowedByUser(userId: number): boolean {
    return this.borrowedBy?.id === userId;
  }
}
