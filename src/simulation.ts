import fetch from "node-fetch";
import MerkleSDK from "sdk";

export type StateOverrideParameters = {
  accounts?: Record<
    string,
    Partial<{
      nonce: number;
      balance: number;
    }>
  >;

  contractCodes?: Record<string, Uint8Array>;

  storage?: Record<string, Record<string, Uint8Array>>;
};

export type Call = {
  from: string;
  to: string;
  data?: string;
  value?: string;
  nonce?: number;
  gasLimit?: number;
  overrides?: StateOverrideParameters;
};

export type Bundle = {
  chainId: number;
  blockNumber?: number;
  calls: Call[];
  overrides?: StateOverrideParameters;
};

export type SimulationCallResult = {
  logs: {
    address: string;
    topics: string[];
    data: string;
  }[];
  gasUsed: bigint;
  result: string;
  addressCreated?: string;
  status: number;
  error?: {
    type: string;
    message: string;
  };
  internalTransfers?: InternalTransfer[];
};

export type InternalTransfer = {
  from: string;
  to: string;
  amount: bigint;
};

export type SimulationResult = {
  id: string;
  chainId: number;
  blockNumber: bigint;
  processTime: number;
  calls: SimulationCallResult[];
};

class SimulationApi {
  private _sdk: MerkleSDK;

  constructor(sdk: MerkleSDK) {
    this._sdk = sdk;
  }

  async simulate(bundle: Bundle): Promise<SimulationResult> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Token ${this._sdk.apiKey}`,
    };

    const res = await fetch(`https://api.merkle.io/v1/simulate`, {
      method: "POST",
      body: JSON.stringify(bundle),
      headers,
    });

    if (res.status !== 200) {
      throw new Error(
        `Failed to simulate bundle: ${res.statusText}: ${await res.text()}`
      );
    }

    const json = await res.json();

    return json as SimulationResult;
  }
}

export default SimulationApi;
