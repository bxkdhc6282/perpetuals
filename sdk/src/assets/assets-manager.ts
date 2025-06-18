import { Asset, AssetType } from "../types";
import assets from "./supported-assets.json";

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
    return Object.values(this.assets);
  }

  public getAssetByType(type: AssetType): Asset[] {
    return Object.values(this.assets).filter((asset) => asset.type === type);
  }

  public getAssetByIsStable(isStable: boolean): Asset[] {
    return Object.values(this.assets).filter(
      (asset) => asset.isStable === isStable
    );
  }

  public getAssetByTypeAndIsStable(
    type: AssetType,
    isStable: boolean
  ): Asset[] {
    return Object.values(this.assets).filter(
      (asset) => asset.type === type && asset.isStable === isStable
    );
  }

  private loadAssets() {
    assets.assets.forEach((asset) => {
      this.assets[asset.feedId] = {
        ...asset,
        type: asset.type as AssetType,
      };
    });
  }
}
