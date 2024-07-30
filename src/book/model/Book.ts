import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/model/User';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.borrowedBooks, { nullable: true })
  borrowedBy?: User;

  @ManyToMany(() => User, (user) => user.returnedBooks)
  returnedByUsers: User[];

  isBorrowed(): boolean {
    return typeof this.borrowedBy?.id === 'number';
  }

  isBorrowedByUser(userId: number): boolean {
    return this.borrowedBy?.id === userId;
  }
}
