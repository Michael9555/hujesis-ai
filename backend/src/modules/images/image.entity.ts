import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Prompt } from '../prompts/prompt.entity';

export enum ImageStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('generated_images')
@Index(['userId', 'createdAt'])
@Index(['promptId'])
@Index(['status'])
export class GeneratedImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 500 })
  imageUrl!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnailUrl?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  originalFilename?: string;

  @Column({ type: 'int', nullable: true })
  width?: number;

  @Column({ type: 'int', nullable: true })
  height?: number;

  @Column({ type: 'bigint', nullable: true })
  fileSize?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mimeType?: string;

  @Column({
    type: 'enum',
    enum: ImageStatus,
    default: ImageStatus.PENDING,
  })
  status!: ImageStatus;

  @Column({ type: 'text', nullable: true })
  promptUsed?: string;

  @Column({ type: 'text', nullable: true })
  negativePromptUsed?: string;

  @Column({ type: 'jsonb', nullable: true })
  generationSettings?: {
    width: number;
    height: number;
    steps: number;
    cfgScale: number;
    sampler: string;
    seed: number;
    model?: string;
  };

  @Column({ type: 'int', nullable: true })
  generationTimeMs?: number;

  @Column({ type: 'boolean', default: false })
  isFavorite!: boolean;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.generatedImages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'uuid', nullable: true })
  promptId?: string;

  @ManyToOne(() => Prompt, (prompt) => prompt.generatedImages, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'promptId' })
  prompt?: Prompt;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}


