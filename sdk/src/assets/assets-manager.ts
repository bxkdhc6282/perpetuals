import { Asset, AssetType } from '../types';
import assets from './supported-assets.json';

export class AssetManager {
  private static instance: AssetManager;

  private assets: Record<string, Asset> = {};

  constructor() {
    this.loadAssets();
  }

  public static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  public getAsset(assetId: string): Asset {
    return this.assets[assetId];
  }

  public getAssetByMint(mint: string): Asset {
    return this.assets[mint];
  }

  public getAssetBySymbol(symbol: string): Asset {
    return this.assets[symbol];
  }

  public getAllAssets(): Asset[] {
    // Return unique assets by filtering out duplicate entries
    const uniqueAssets = new Map<string, Asset>();
    Object.values(this.assets).forEach((asset) => {
      uniqueAssets.set(asset.feedId, asset);
    });
    return Array.from(uniqueAssets.values());
  }

  public getAssetByType(type: AssetType): Asset[] {
    const uniqueAssets = new Map<string, Asset>();
    Object.values(this.assets).forEach((asset) => {
      if (asset.type === type) {
        uniqueAssets.set(asset.feedId, asset);
      }
    });
    return Array.from(uniqueAssets.values());
  }

  public getAssetByIsStable(isStable: boolean): Asset[] {
    const uniqueAssets = new Map<string, Asset>();
    Object.values(this.assets).forEach((asset) => {
      if (asset.isStable === isStable) {
        uniqueAssets.set(asset.feedId, asset);
      }
    });
    return Array.from(uniqueAssets.values());
  }

  public getAssetByTypeAndIsStable(type: AssetType, isStable: boolean): Asset[] {
    const uniqueAssets = new Map<string, Asset>();
    Object.values(this.assets).forEach((asset) => {
      if (asset.type === type && asset.isStable === isStable) {
        uniqueAssets.set(asset.feedId, asset);
      }
    });
    return Array.from(uniqueAssets.values());
  }

  private loadAssets() {
    assets.assets.forEach((asset) => {
      const assetWithType = {
        ...asset,
        type: asset.type as AssetType,
      };

      // Index by multiple keys for different lookup methods
      this.assets[asset.feedId] = assetWithType;
      this.assets[asset.symbol] = assetWithType;
      this.assets[asset.mint] = assetWithType;
    });
  }
}
