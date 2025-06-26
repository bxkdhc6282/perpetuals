import { Connection, PublicKey } from '@solana/web3.js';
// import { OracleClient } from '../../oracle/oracle-client';
import { KeypairWalletAdapter } from '../../wallets/keypair-wallet-adapter';
import { PerpetualsClient } from '../../perpetuals-client';
// import { AssetManager } from '../../assets/assets-manager';
// import { fromBN } from '../../utils/bn';
import { IDL } from '../../idl/idl';
import { loadKeypair } from '../../wallets/utils/load-keypair';
import { serialize } from '../../wallets/utils/serializer';

const connection = new Connection('https://api.devnet.solana.com');
const wallet = new KeypairWalletAdapter(loadKeypair('buffer-key.json'), connection);

// Debug: Check what's in the IDL
console.log('IDL address:', IDL.address);
console.log('IDL keys:', Object.keys(IDL));
console.log('IDL type:', typeof IDL);

// const oracleClient = new OracleClient(connection, wallet, 'devnet');
const client = new PerpetualsClient(wallet, 'devnet');

async function test() {
  // const assetManager = AssetManager.getInstance();

  // // First, let's check what pools are available
  // console.log('Checking available pools...');
  // try {
  //   const perpetuals = await client.getPerpetuals();
  //   console.log('Perpetuals config:', perpetuals);

  //   const pools = await client.getPools();
  //   console.log('Available pools:', pools.map((p) => p?.name).filter(Boolean));

  //   // Check if 'forex' pool exists
  //   const forexPool = pools.find((p) => p?.name === 'forex');
  //   if (!forexPool) {
  //     console.log(
  //       'Forex pool not found! Available pools:',
  //       pools.map((p) => p?.name).filter(Boolean)
  //     );
  //     return;
  //   }

  //   console.log('Forex pool found:', {
  //     name: forexPool.name,
  //     ratios: forexPool.ratios.map((r) => ({
  //       target: fromBN(r.target),
  //       min: fromBN(r.min),
  //       max: fromBN(r.max),
  //     })),
  //     aumUsd: forexPool.aumUsd.toString(),
  //     bump: forexPool.bump,
  //     lpTokenBump: forexPool.lpTokenBump,
  //     inceptionTime: forexPool.inceptionTime.toString(),
  //   });

  //   // Check custodies in the forex pool
  //   const custodies = await client.getCustodies('forex');
  //   console.log(
  //     'Forex pool custodies:',
  //     custodies.map((c) => c?.mint.toString())
  //   );
  // } catch (error) {
  //   console.error('Error checking pools:', error);
  //   return;
  // }

  // const custody = assetManager.getAssetBySymbol('AUD');
  // const collateral = assetManager.getAssetBySymbol('USD');

  try {
    const thisCustody = await client.getCustody('AUD_USD', new PublicKey(''));
    const serializedCustody = serialize(thisCustody);
    console.log({
      serializedCustody,
    });
  } catch (error) {
    console.error('Error getting custody:', error);
  }

  // console.log('Using custody:', custody);
  // console.log('Using collateral:', collateral);

  // const result = await client.getOraclePrice(
  //   'forex',
  //   new PublicKey(collateral.mint),
  //   false,
  //   collateral.feedId
  // );

  // console.log('Oracle price:', result.toString());

  // const result = await client.getEntryPriceAndFee(
  //   'forex',
  //   new PublicKey(custody.mint),
  //   new PublicKey(collateral.mint),
  //   toBN(3000),
  //   toBN(20000),
  //   'long',
  //   custody.feedId,
  //   collateral.feedId
  // );

  // console.log(result);
}

test();
