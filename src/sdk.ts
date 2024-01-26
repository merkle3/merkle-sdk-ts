import PrivatePool from "./pool";
import Transactions from "./transactions";
import OverwarchApi from "./overwatch";
import SimulationApi from "./simulation";

class MerkleSDK {
  public apiKey?: string;

  public pool: PrivatePool;
  public transactions: Transactions;
  public overwatch: OverwarchApi;
  public simulation: SimulationApi;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;

    this.pool = new PrivatePool(this);
    this.transactions = new Transactions(this);
    this.overwatch = new OverwarchApi(this);
    this.simulation = new SimulationApi(this);
  }
}

export default MerkleSDK;
