import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(process.env.PG_URI, {
  dialect: "postgres",
  logging: false, // hides raw SQL logs
});

export async function connectPostgres() {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected to:", sequelize.getDatabaseName());
  } catch (err) {
    console.error("PostgreSQL connection error:", err.message);
  }
}

