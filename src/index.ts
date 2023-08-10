import { keys } from "@zcloak/did";
import { Keyring } from "@zcloak/keyring";
import { initCrypto } from "@zcloak/crypto";

import { ethers } from "ethers";
import { Presets, Client } from "userop";

import { counterAbi } from "./abi";
import { provider } from "./provider";
import { getCalldata } from "./calldata";
import { fund, estimateRequiredGasPrice } from "./fund";

import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

(async () => {
  await initCrypto();

  // generate did
  const mnemonic = process.env.MNEMONIC!;
  const keyring = new Keyring();
  const did = keys.fromMnemonic(keyring, mnemonic, "ecdsa");
  console.log(`✨ Generate DID Successfully !!!`);
  console.log(`DID Controller key: ${did.getKeyUrl("controller")}`);

  // generate ethereum address
  const signWallet = ethers.Wallet.fromMnemonic(mnemonic);
  console.log(
    `DID corrosponding Address of signing UO: ${await signWallet.getAddress()}\n`
  );

  // init simpleAccount and client
  console.log("🔧 Init Bundler Connection (SimpleAccount & Client)...");
  const sa = await Presets.Builder.SimpleAccount.init(
    signWallet,
    process.env.RPC_URL!
  );
  const client = await Client.init(process.env.RPC_URL!);
  const scwAddr = sa.getSender();
  console.log(`SCW Address (non-deploy): ${scwAddr}`);

  // prefund SCW
  const requiredBalance = await estimateRequiredGasPrice();
  const scwBalance = await provider.getBalance(scwAddr);
  if (scwBalance.lt(requiredBalance.div(2))) {
    let fundBalance = requiredBalance.sub(scwBalance).toString();
    console.log(`💰 SCW Balance: ${ethers.utils.formatEther(scwBalance)} ETH`);
    console.log(`🤷 Prefund SCW ${fundBalance} Wei...\n`);
    await fund(scwAddr, fundBalance);
  } else {
    console.log(
      `SCW Balance is enough, SCW Balance: ${ethers.utils.formatEther(
        scwBalance
      )} ETH\n`
    );
  }

  // call target contract (build calldata)
  console.log("🎯 Send UO and call contract");
  console.log("Build target contract method calldata...");
  const inf = new ethers.utils.Interface(counterAbi);
  const addCalldata = getCalldata(inf, "add", []);
  console.log(`method 'add()' calldata: ${addCalldata}`);

  const addUO = await client.sendUserOperation(
    sa.execute(process.env.TARGET_CONTRACT!, 0, addCalldata),
    {
      onBuild: (op) => {
        console.log("Signed UO: ", op);
      },
    }
  );
  const ev = await addUO.wait();
  console.log(`add counter Tx Hash: ${ev?.transactionHash ?? null}`);
})();
