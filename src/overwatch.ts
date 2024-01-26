import fetch from "node-fetch";
import MerkleSDK from "sdk";

class OverwatchApi {
  private _sdk: MerkleSDK;

  constructor(sdk: MerkleSDK) {
    this._sdk = sdk;
  }

  async watch(address: string): Promise<void> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Token ${this._sdk.apiKey}`,
    };

    const res = await fetch(`https://api.merkle.io/v1/overwatch/addresses`, {
      method: "POST",
      body: JSON.stringify({
        address,
      }),
      headers,
    });

    if (res.status !== 200) {
      throw new Error(
        `Failed to watch address: ${res.statusText}: ${await res.text()}`
      );
    }
  }

  async unwatch(address: string): Promise<void> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Token ${this._sdk.apiKey}`,
    };

    const res = await fetch(
      `https://api.merkle.io/v1/overwatch/addresses/${address}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (res.status !== 200) {
      throw new Error(
        `Failed to unwatch address: ${res.statusText}: ${await res.text()}`
      );
    }
  }

  async declare(chainId: number, hash: string): Promise<void> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Token ${this._sdk.apiKey}`,
    };

    const res = await fetch(`https://api.merkle.io/v1/overwatch/declare`, {
      method: "POST",
      body: JSON.stringify({
        chain_id: chainId,
        hash,
      }),
      headers,
    });

    if (res.status !== 200) {
      throw new Error(
        `Failed to declare hash: ${res.statusText}: ${await res.text()}`
      );
    }
  }
}

export default OverwatchApi;
