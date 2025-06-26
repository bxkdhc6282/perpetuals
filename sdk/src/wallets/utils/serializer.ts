import { BN } from '@coral-xyz/anchor';
import { fromBN } from '../../utils/bn';
import { PublicKey } from '@solana/web3.js';

type SerializedValue =
  | string
  | number
  | boolean
  | null
  | SerializedValue[]
  | { [key: string]: SerializedValue };

/**
 * Serializes complex data types into simple JavaScript values
 * @param value The value to serialize
 * @param options Configuration options for serialization
 * @returns Serialized value
 */
export const serialize = <T>(
  value: T,
  options: {
    /**
     * Number of decimal places for BN conversion
     * If not provided, BNs will be converted to integers
     */
    decimals?: number;
    /**
     * Whether to maintain PublicKey type (false) or convert to string (true)
     * @default true
     */
    stringifyPublicKey?: boolean;
  } = {}
): SerializedValue => {
  if (value === null || value === undefined) {
    return null;
  }

  // Handle BN conversion
  if (value instanceof BN) {
    try {
      return fromBN(value);
    } catch (e) {
      // If number is too large for JS number, return as string
      return value.toString();
    }
  }

  // Handle PublicKey conversion
  if (value instanceof PublicKey) {
    return value.toBase58();
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map((item) => serialize(item, options));
  }

  // Handle objects
  if (typeof value === 'object') {
    const entries = Object.entries(value);

    // Check if this is a discriminated union type (single key with empty object value)
    if (entries.length === 1) {
      const [key, val] = entries[0];
      // Check if the value is an empty object or Record<string, never>
      if (val && typeof val === 'object' && Object.keys(val).length === 0) {
        return key;
      }
    }

    return Object.fromEntries(entries.map(([key, val]) => [key, serialize(val, options)]));
  }

  // Return primitive values as is
  return value as SerializedValue;
};

/**
 * Type guard to check if a value is a valid base58 string
 */
export const isBase58 = (value: string): boolean => {
  return /^[1-9A-HJ-NP-Za-km-z]+$/.test(value);
};
