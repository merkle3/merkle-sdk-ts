import MerkleSDK from "./sdk";
import WebSocket from 'ws'
import Backoff from "./utils/backoff";
import { TypedEvent } from "./utils/typed-events";

type Auction = {
    id: string;
    closes_at: string;
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

class PrivatePool {
    private _sdk: MerkleSDK;

    constructor(sdk: MerkleSDK) {
        this._sdk = sdk;
    }

    auctions(): TypedEvent<Auction> {
        const emitter = new TypedEvent<Auction>();
        let timeout = new Backoff()

        function connect() {
            // open the websocket
            const conn = new WebSocket('wss://pool.usemerkle.com/stream/auctions');

            // listen for messages
            conn.onmessage = function (event: any) {
                const data = JSON.parse(event.data) as Auction;

                // emit the event
                emitter.emit(data);
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
    async bid(auctionId: string, backrun: string) {

    }
}
 
export default PrivatePool;