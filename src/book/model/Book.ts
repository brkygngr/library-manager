import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/model/User';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.borrowedBooks, { nullable: true })
  borrowedBy?: User | null;

  @ManyToMany(() => User, (user) => user.returnedBooks)
  returnedByUsers: User[];

  @Column({ type: 'float', default: -1.0 })
  score: number = -1.0;

  isBorrowed(): boolean {
    return typeof this.borrowedBy?.id === 'number';
  }

  isBorrowedByUser(userId: number): boolean {
    return this.borrowedBy?.id === userId;
  }

  addScore(score: number) {
    if (this.score === -1.0) {
      this.score = score;

      return;
    }

    const scorerCount = this.returnedByUsers.length;

    const totalScore = this.score * scorerCount;

    this.score = (totalScore + score) / (scorerCount + 1);
  }
}
