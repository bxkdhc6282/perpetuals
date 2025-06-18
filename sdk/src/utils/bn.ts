import { BN } from "@coral-xyz/anchor";
import assert from "assert";

/**
 * Safely converts up to 53-bit integer to BN.
 * Throws if the value exceeds Number.MAX_SAFE_INTEGER.
 */
export function toBN(value: number | string | bigint): BN {
  if (typeof value === "number") {
    assert(
      Number.isSafeInteger(value),
      `toBN: number ${value} exceeds JS safe integer range`
    );
    return new BN(value);
  }
  return new BN(value.toString());
}

/**
 * Safely converts a BN to a number, throws if it exceeds JS safe integer range.
 */
export function fromBN(bn: BN): number {
  const str = bn.toString(10);
  const val = Number(str);
  assert(
    BigInt(str) <= BigInt(Number.MAX_SAFE_INTEGER),
    `fromBN: BN value ${str} exceeds JS safe integer range`
  );
  return val;
}
