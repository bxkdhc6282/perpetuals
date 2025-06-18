import { FeesMode, OracleType, Side } from '../idl/types/params';

export function stringToOracleType(type: 'none' | 'custom' | 'pyth'): OracleType {
  switch (type.toLowerCase()) {
    case 'none':
      return { none: {} };
    case 'custom':
      return { custom: {} };
    case 'pyth':
      return { pyth: {} };
    default:
      throw new Error('Invalid oracle type');
  }
}

export function stringToSide(side: 'none' | 'long' | 'short'): Side {
  switch (side.toLowerCase()) {
    case 'none':
      return { none: {} };
    case 'long':
      return { long: {} };
    case 'short':
      return { short: {} };
    default:
      throw new Error('Invalid side');
  }
}

export function stringToFeesMode(mode: 'fixed' | 'linear' | 'optimal'): FeesMode {
  switch (mode.toLowerCase()) {
    case 'fixed':
      return { fixed: {} };
    case 'linear':
      return { linear: {} };
    case 'optimal':
      return { optimal: {} };
    default:
      throw new Error('Invalid fees mode');
  }
}
