import MerkleSDK from "./sdk";
import { TypedEventEmitter } from "./utils/typed-events";
import { ethers } from "ethers";
import Backoff from "./utils/backoff";
import { WebSocket } from "ws";
import fetch from "node-fetch";

type TypedEventEmitterEvents = {
  transaction: [ethers.Transaction];
  error: [Error];
};

export enum Chains {
  Ethereum = 1,
  Polygon = 137,
  BinanceSmartChain = 56,
}

export type TransactionTrace = {
  hash: string;
  chainId: Chains;
  firstSeenAt: Date;
  trace: {
    time: Date;
    origin: string;
  }[];
  txData: string;
};

class Transactions {
  private _sdk: MerkleSDK;

  constructor(sdk: MerkleSDK) {
    this._sdk = sdk;
  }

  stream(chainId = 1): TypedEventEmitter<TypedEventEmitterEvents> {
    // create a typed event emitter
    const txStream = new TypedEventEmitter<TypedEventEmitterEvents>();
    const timeout = new Backoff();

    const me = this;

    async function connect() {
      while (true) {
        const closed = new Promise((resolve, reject) => {
          // connect to websocket
          const ws = new WebSocket(
            `wss://txs.merkle.io/ws/${me._sdk.apiKey}/${chainId}`
          );

          // on message
          ws.on("message", (message: Buffer) => {
            try {
              const transaction = ethers.Transaction.from(
                "0x" + message.toString("hex")
              );

              txStream.emit("transaction", transaction);
            } catch (e) {
              // sometimes transactions are not valid, ignore them
            }
          });

          // on error
          ws.on("error", (error: Error) => {
            // pass the error to the typed stream
            txStream.emit("error", error);
            resolve(null);
          });

          // on close
          ws.on("close", () => {
            resolve(null);
          });

          // automatically close the connection after 10 minutes
          // and restart it
          setTimeout(() => {
            ws.close();
          }, 10 * 60 * 1000);
        });

        await closed;
      }
    }

    connect();

    return txStream;
  }

  async trace(txHash: string): Promise<TransactionTrace | null> {
    const url = `https://txs.merkle.io/trace/${txHash}`;

    const response = await fetch(url);

    if (response.status == 404) {
      return null;
    }

    const body = await response.json();

    return {
      firstSeenAt: new Date(body.firstSeenAt),
      hash: body.hash,
      chainId: body.chainId,
      trace: body.trace.map((t: any) => ({
        time: new Date(t.time),
        origin: t.origin,
      })),
      txData: body.txData,
    };
  }
}

export default Transactions;
