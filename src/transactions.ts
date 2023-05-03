import MerkleSDK from "./sdk";
import {loadSync} from "@grpc/proto-loader";
import {credentials, loadPackageDefinition} from "@grpc/grpc-js";
import {ServiceClientConstructor} from "@grpc/grpc-js/build/src/make-client";
import { TypedEventEmitter } from "./utils/typed-events";
import { ethers } from "ethers";
import Backoff from "./utils/backoff";

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
        const txStream = new TypedEventEmitter<TypedEventEmitterEvents>();
        const pwd = __dirname
        const PROTO_PATH = pwd + '/proto/broker.proto'

        const packageDefinition = loadSync(PROTO_PATH, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
        })

        const protoDescriptor = loadPackageDefinition(packageDefinition)

        const BrokerApi = (protoDescriptor.usemerkle as any).com.broker.proto.BrokerApi as ServiceClientConstructor
        const apikey = this._sdk.apiKey
        const timeout = new Backoff()

        function connect() {
            const client = new BrokerApi('txs.usemerkle.com:80', credentials.createInsecure())

            const stream = client.StreamReceivedTransactions({
                api_key: apikey,
                chain_id: chainId
            })

            stream.on('data', (message: { txHash: string; txBytes: string }) => {
                const transaction = ethers.Transaction.from('0x' + message.txBytes)

                txStream.emit('transaction', transaction)
            })

            // on error
            stream.on('error', (error: Error) => {
                // pass the error to the typed stream
                txStream.emit('error', error)
            })

            // on close
            stream.on('end', () => {
                setTimeout(connect, timeout.next())
            })
        }

        connect()

        return txStream
    }
}

export default Transactions;