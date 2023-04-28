![Logo](public/logo.png)

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

merkle.pool.auctions().on(auction => {
    console.log('new auction: ', auction)
})
```

### Stream transactions

Stream transactions from Merkle's private network of transaction on Ethereum. [Learn more](https://docs.usemerkle.com/transaction-stream/what-is-merkle-transaction-stream)

```typescript
import Merkle from '@mkl3/sdk'

const merkle = new Merkle('<API KEY>') // optional, get one at mbs.usemerkle.com

merkle.transactions.stream().on(tx => {
    console.log('tx from: ', tx.from)
})
```