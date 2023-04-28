import PrivatePool from "./pool";
import Transactions from "./transactions";

class MerkleSDK {
    public apiKey?: string;

    public pool: PrivatePool;
    public transactions: Transactions;

    constructor(apiKey?: string) {
        this.apiKey = apiKey;

        this.pool = new PrivatePool(this);
        this.transactions = new Transactions(this);
    }
}

export default MerkleSDK;