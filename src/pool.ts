import MerkleSDK from "./sdk";
import WebSocket from 'ws'
import Backoff from "./utils/backoff";
import { TypedEventEmitter } from "./utils/typed-events";
import { ethers } from 'ethers'
import fetch from 'node-fetch';

type Auction = {
    id: string;
    closes_at: string;
    chain_id: number;
    created_at: string;
    fee_recipient: string;
    transaction: {
        data: string;
        from: string;
        gas: number;
        hash: string;
        to: string;
        value: string;
    }
}

enum PrivacyHint {
    To = 'to',
    From = 'from',
    Value = 'value',
    Data = 'data',
    Gas = 'gas_limit',
    GasPrice = 'gas_price',
    Logs = 'logs',
    Nonce = 'nonce',
}

type SendTransactionOptions = {
    feeRecipient?: string;
    privacy?: 'default' | 'public' | 'private' | 'custom';
    hints?: PrivacyHint[];
}

type PrivatePoolStreamEvents = {
    'auction': [Auction],
    'error': [Error]
}

class PrivatePool {
    private _sdk: MerkleSDK;

    constructor(sdk: MerkleSDK) {
        this._sdk = sdk;
    }

    auctions(): TypedEventEmitter<PrivatePoolStreamEvents> {
        const emitter = new TypedEventEmitter<PrivatePoolStreamEvents>();
        let timeout = new Backoff()

        function connect() {
            // open the websocket
            const conn = new WebSocket('wss://pool.usemerkle.com/stream/auctions');

            // listen for messages
            conn.onmessage = function (event: any) {
                const data = JSON.parse(event.data) as Auction;

                // emit the event
                emitter.emit('auction', data);
            };

            // on error
            conn.onerror = function (event: WebSocket.ErrorEvent) {
                // pass the error to the typed stream
                emitter.emit('error', event.error);
            };

            // on close, reconnect
            conn.onclose = function () {
                setTimeout(connect, timeout.next());
            };
        }

        connect()

        return emitter;
    }

    // bid a backrun on a given auction
    async bid(txHash: string, backrun: string) {
        const body = {
            method: "eth_sendBundle",
            params: [
                {
                    txs: [txHash, backrun],
                    blockNumber: 0,
                }
            ],
            id: 1,
            jsonrpc: "2.0"
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        }

        if (this._sdk.apiKey) {
            headers['X-MBS-Key'] = this._sdk.apiKey
        }
        
        const res = await fetch(`https://pool.usemerkle.com/relay`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers
        })
    }

    async send(tx: ethers.Transaction, opts?: SendTransactionOptions) {
        // serialize to hex
        const hex = tx.serialized

        // send to the pool
        return await this.sendRaw(hex, opts)
    }

    async sendRaw(transaction: string, opts?: SendTransactionOptions) {
        const tx = ethers.Transaction.from(transaction)

        const body = {
            transactions: [transaction],
            fee_recipient: opts?.feeRecipient ?? tx.from,
            privacy: opts?.privacy ?? 'default',
            hints: opts?.hints ?? []
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        }

        if (this._sdk.apiKey) {
            headers['X-MBS-Key'] = this._sdk.apiKey
        }
        
        const res = await fetch(`https://pool.usemerkle.com/transactions`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers
        })

        if (res.status !== 200) {
            throw new Error(await res.text())
        }

        const data = await res.json()

        return data
    }  
}
 
export default PrivatePool;