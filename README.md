<img src="public/merkle-large.png" width="100" height="100"/>

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

Stream auctions from Merkle's private pool. [Learn more](https://docs.usemerkle.com/private-pool/what-is-merkle-private-pool)

```typescript
import Merkle from '@mkl3/sdk'

const merkle = new Merkle('<API KEY>') // optional, get one at mbs.usemerkle.com

// stream auctions and make bids
merkle.pool.auctions().on('auction', auction => {
    console.log('new auction: ', auction)

    // construct a backrun
    const backrun = "0x...."

    // make a bid
    merkle.pool.bid(auction.transaction.hash, backrun)
})

// send new transactions for auctions
merkle.pool.send(tx, { // a signed ethers.Transaction
    // optional parameters
    feeRecipient: "0x", // where to receive the bid revenue, defaults to the tx.from
    hints: [] // what hints to provide to searchers, see https://docs.usemerkle.com/private-pool/privacy
}) 
```

### Stream transactions

Stream transactions from Merkle's private network of transaction on Ethereum. [Learn more](https://docs.usemerkle.com/transaction-stream/what-is-merkle-transaction-stream)

```typescript
import Merkle from '@mkl3/sdk'

const merkle = new Merkle('<API KEY>') // optional, get one at mbs.usemerkle.com

merkle.transactions.stream().on('transaction', tx => {
    console.log('tx from: ', tx.from)
})
```