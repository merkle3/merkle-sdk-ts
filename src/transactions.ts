import MerkleSDK from "./sdk";
import {loadSync} from "@grpc/proto-loader";
import {credentials, loadPackageDefinition} from "@grpc/grpc-js";
import {ServiceClientConstructor} from "@grpc/grpc-js/build/src/make-client";
import { TypedEvent } from "./utils/typed-events";
import { ethers } from "ethers";

class Transactions {
    private _sdk: MerkleSDK;

    constructor(sdk: MerkleSDK) {
        this._sdk = sdk;
    }

    stream(chainId = 1): TypedEvent<ethers.Transaction> {
        const txStream = new TypedEvent<ethers.Transaction>();
        const PROTO_PATH = './proto/broker.proto'

        const packageDefinition = loadSync(PROTO_PATH, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
        })

        const protoDescriptor = loadPackageDefinition(packageDefinition)

        const BrokerApi = (protoDescriptor.usemerkle as any).com.broker.proto.BrokerApi as ServiceClientConstructor

        const client = new BrokerApi('txs.usemerkle.com:80', credentials.createInsecure())

        const stream = client.StreamReceivedTransactions({
            api_key: this._sdk.apiKey,
            chain_id: chainId
        })

          stream.on('data', (message: { txHash: string; txBytes: string }) => {
            const transaction = ethers.Transaction.from('0x' + message.txBytes)

            txStream.emit(transaction)
        })

        return txStream
    }
}

export default Transactions;