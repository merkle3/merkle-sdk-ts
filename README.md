<img src="public/merkle-large.png" width="80" height="80" style="border-radius: 4px"/>

**Merkle is building crypto infrastructure**. [Join us on discord](https://discord.gg/Q9Dc7jVX6c).

# Merkle SDK

The Merkle SDK is a great way to access our products.

## Install

Install the Merkle SDK package:

```
yarn add @mkl3/sdk
```

## Features

### Stream auctions

Stream auctions from Merkle's private pool. [Learn more](https://docs.merkle.io/private-pool/what-is-merkle-private-pool)

```typescript
import Merkle from "@mkl3/sdk";

const merkle = new Merkle("<API KEY>"); // optional, get one at mbs.merkle.io

// stream auctions and make bids
merkle.pool.auctions().on("auction", (auction) => {
  console.log("new auction: ", auction);

  // construct a backrun
  const backrun = "0x....";

  // make a bid
  merkle.pool.bid(auction.transaction.hash, backrun);
});

// send new transactions for auctions
merkle.pool.send(tx, {
  // a signed ethers.Transaction
  // optional parameters
  feeRecipient: "0x", // where to receive the bid revenue, defaults to the tx.from
  hints: [], // what hints to provide to searchers, see https://docs.merkle.io/private-pool/privacy
});
```

### Stream public mempool transactions

Stream public mempool transactions from merkle's ultra fast network on Ethereum, Polygon and BSC. [Learn more](https://docs.merkle.io/transaction-stream/what-is-merkle-transaction-stream)

Typescript:

```typescript
import Merkle from "@mkl3/sdk";

const merkle = new Merkle("<API KEY>"); // get one at mbs.merkle.io

// stream ethereum transactions
merkle.transactions.stream().on("transaction", (tx) => {
  console.log("tx from: ", tx.from);
});

// stream polygon transactions
merkle.transactions.stream(137).on("transaction", (tx) => {
  console.log("tx from: ", tx.from);
});

// stream bnb transactions
merkle.transactions.stream(56).on("transaction", (tx) => {
  console.log("tx from: ", tx.from);
});
```

Javascript:

```javascript
import Merkle from "@mkl3/sdk";

const merkle = new Merkle("<API KEY>"); //get one at mbs.merkle.io

// stream ethereum transactions
merkle.transactions.stream().on("transaction", (tx) => {
  console.log("tx from: ", tx.from);
});

// stream polygon transactions
merkle.transactions.stream(137).on("transaction", (tx) => {
  console.log("tx from: ", tx.from);
});

// stream bnb transactions
merkle.transactions.stream(56).on("transaction", (tx) => {
  console.log("tx from: ", tx.from);
});
```

## Transaction tracing

Know exactly when and where a transaction was broadcasted. [Learn more](https://docs.merkle.io/transaction-network/tracing)

```typescript
import Merkle from "@mkl3/sdk";

const merkle = new Merkle("<API KEY>"); //get one at mbs.merkle.io

// trace a transaction
merkle.transactions.trace("0x...").then((trace) => {
  console.log("trace: ", trace);
});
```
