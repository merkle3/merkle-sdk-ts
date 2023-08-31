import MerkleSDK from "./sdk";
import {loadSync} from "@grpc/proto-loader";
import {credentials, loadPackageDefinition} from "@grpc/grpc-js";
import {ServiceClientConstructor} from "@grpc/grpc-js/build/src/make-client";
import { TypedEventEmitter } from "./utils/typed-events";
import { ethers } from "ethers";
import Backoff from "./utils/backoff";
import { WebSocket } from "ws";

type TypedEventEmitterEvents = {
    'transaction': [ethers.Transaction],
    'error': [Error]
}

class Transactions {
    private _sdk: MerkleSDK;

    constructor(sdk: MerkleSDK) {
        this._sdk = sdk;
    }

    stream(chainId = 1): TypedEventEmitter<TypedEventEmitterEvents> {

        // create a typed event emitter
        const txStream = new TypedEventEmitter<TypedEventEmitterEvents>();
        const timeout = new Backoff()

        const me = this;

        function connect() {
            // connect to websocket
            const ws = new WebSocket(`wss://txs.merkle.io/ws/${me._sdk.apiKey}`)

            // on open
            ws.on('open', () => {
                console.log('connected to websocket')
            })

            // on message
            ws.on('message', (message: string) => {
                const transaction = ethers.Transaction.from('0x' + message)

                txStream.emit('transaction', transaction)
            })

            // on error
            ws.on('error', (error: Error) => {
                // pass the error to the typed stream
                txStream.emit('error', error)
            })

            // on close
            ws.on('close', () => {
                setTimeout(connect, timeout.next())
            })
        }

        connect()

        return txStream
    }
}

export default Transactions;