import path from "path";
import dotenv from "dotenv";

import type { Interface } from "ethers/lib/utils";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

/**
 * get calldata
 * @param inf ethers.utils.Interface
 * @param method contract method name
 * @param params contract method params
 * @returns calldata of contract method
 */
export function getCalldata(
  inf: Interface,
  method: string,
  params: any[]
): string {
  return inf.encodeFunctionData(method, params);
}
