import { Connection, Keypair } from "@solana/web3.js";
import { OracleClient } from "../../oracle/oracle-client";
import { KeypairWalletAdapter } from "../../wallets/keypair-wallet-adapter";

const connection = new Connection("https://mainnetbeta-rpc.eclipse.xyz");
const wallet = new KeypairWalletAdapter(Keypair.generate(), connection);

const oracleClient = new OracleClient(connection, wallet, "devnet");

async function test() {
  const result = await oracleClient.getTwapUpdate(
    "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43"
  );
  console.log(result);
}

test();
