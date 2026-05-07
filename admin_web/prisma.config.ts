import * as dotenv from 'dotenv';
import { defineConfig } from '@prisma/config';

// Memaksa sistem membaca file .env
dotenv.config();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});