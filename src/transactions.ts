import MerkleSDK from "./sdk";
import { TypedEventEmitter } from "./utils/typed-events";
import { ethers } from "ethers";
import Backoff from "./utils/backoff";
import { WebSocket } from "ws";

type TypedEventEmitterEvents = {
  transaction: [ethers.Transaction];
  error: [Error];
};

export enum Chains {
  Ethereum = 1,
  Polygon = 137,
  BinanceSmartChain = 56,
}

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
          });

          // on close
          ws.on("close", () => {
            resolve(null);
          });
        });

        await closed;
      }
    }

    connect();

    return txStream;
  }
}

export default Transactions;
