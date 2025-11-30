import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "./index";

// Entity imports will be added here
import { User } from "../modules/users/user.entity";
import { Prompt } from "../modules/prompts/prompt.entity";
import { GeneratedImage } from "../modules/images/image.entity";
import { RefreshToken } from "../modules/auth/refresh-token.entity";

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  entities: [User, Prompt, GeneratedImage, RefreshToken],
  migrations: ["src/migrations/*.ts"],
  synchronize: !config.server.isProduction, // Only in development
  logging: !config.server.isProduction,
  ssl: config.server.isProduction ? { rejectUnauthorized: false } : false,
};

export const AppDataSource = new DataSource(dataSourceOptions);

export const initializeDatabase = async (): Promise<DataSource> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Database connection established successfully");
    }
    return AppDataSource;
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error;
  }
};

export default AppDataSource;
