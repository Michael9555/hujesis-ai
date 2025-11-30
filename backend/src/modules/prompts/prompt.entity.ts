import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../users/user.entity";
import { GeneratedImage } from "../images/image.entity";

export enum PromptCategory {
  PORTRAIT = "portrait",
  LANDSCAPE = "landscape",
  ABSTRACT = "abstract",
  FANTASY = "fantasy",
  SCIFI = "scifi",
  ANIME = "anime",
  REALISTIC = "realistic",
  ARTISTIC = "artistic",
  OTHER = "other",
}

export enum PromptStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  ARCHIVED = "archived",
}

@Entity("prompts")
@Index(["userId", "createdAt"])
@Index(["category"])
@Index(["status"])
export class Prompt {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "text", nullable: true })
  negativePrompt?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({
    type: "enum",
    enum: PromptCategory,
    default: PromptCategory.OTHER,
  })
  category!: PromptCategory;

  @Column({
    type: "enum",
    enum: PromptStatus,
    default: PromptStatus.ACTIVE,
  })
  status!: PromptStatus;

  @Column({ type: "simple-array", nullable: true })
  tags?: string[];

  @Column({ type: "jsonb", nullable: true })
  settings?: {
    width?: number;
    height?: number;
    steps?: number;
    cfgScale?: number;
    sampler?: string;
    seed?: number;
  };

  @Column({ type: "boolean", default: false })
  isFavorite!: boolean;

  @Column({ type: "int", default: 0 })
  usageCount!: number;

  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, (user) => user.prompts, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @OneToMany(() => GeneratedImage, (image) => image.prompt)
  generatedImages!: GeneratedImage[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
