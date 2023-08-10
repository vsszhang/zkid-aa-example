import path from "path";
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const provider = new ethers.providers.AlchemyProvider(
  "goerli",
  process.env.API_KEY
);
