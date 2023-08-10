import path from "path";
import dotenv from "dotenv";
import { ethers } from "ethers";
import { provider } from "./provider";

import type { BigNumber } from "ethers";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prefundWallet = new ethers.Wallet(process.env.PREFUND_SK!).connect(
  provider
);

export async function fund(to: string, amount: string) {
  const txDetail = {
    from: await prefundWallet.getAddress(),
    to,
    value: amount,
  };

  const tx = await prefundWallet.sendTransaction(txDetail);
  await tx.wait();
}

export async function estimateRequiredGasPrice(): Promise<BigNumber> {
  const gasPrice = await provider.getGasPrice();
  return gasPrice.mul(2e6);
}
