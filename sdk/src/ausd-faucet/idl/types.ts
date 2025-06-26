import { AusdFaucet as AusdFaucetIdl } from './ausd_faucet';
import { IdlAccounts } from '@coral-xyz/anchor';

export type FaucetConfig = IdlAccounts<AusdFaucetIdl>['faucetConfig'];
