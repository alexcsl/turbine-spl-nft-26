# SPL Tokens and MPL Core NFTs

TypeScript scripts for creating and transferring an SPL token, and for creating, updating, transferring, and burning an MPL Core NFT on Solana devnet.

---

## Setup

### 1. Add your wallet

Use Node.js, npm, a funded devnet wallet, and a second wallet for the transfer exercises. Place your project wallet keypair at the project root:

```
root/
└── devnet-wallet.json
```

The file must contain the Solana keypair as a JSON array of numbers. Keep keypairs and recovery phrases private. Never commit or share wallet files.

### 2. Install dependencies

```bash
npm ci
```

### 3. Add your image

The image upload script currently reads `MeowySigma.jpg` from the project root. To use a different image, change the path and content type in `src/nft/nft_image.ts`.

```
root/
└── MeowySigma.jpg
```

---

The scripts contain example addresses and metadata URIs. Replace them with your own before running an exercise. Transactions use devnet and require SOL for fees and account funding. Uploads use Irys devnet.

## SPL Token

The SPL scripts use Solana Kit and the original Token Program. The completed mint has six decimals, so one token equals 1,000,000 base units.

| Script | Command | What it does |
|---|---|---|
| `spl_init.ts` | `npm run spl:init` | Creates a new mint account |
| `spl_mint.ts` | `npm run spl:mint` | Creates the sender's associated token account and mints 100 tokens |
| `spl_transfer.ts` | `npm run spl:transfer` | Creates the recipient's associated token account and transfers 25 tokens |

Run these in order for a new mint. Paste the new mint address into `spl_mint.ts` and `spl_transfer.ts`, and set the recipient wallet address in `spl_transfer.ts`. Each successful run of `spl:init` creates a new mint. The ATA creation instructions in the other scripts expect the respective accounts not to exist yet, so check transaction status and account state before rerunning them.

`spl_metadata.ts` is a separate starter script that still references an older example mint. It was not used to set metadata for the mint documented below. Update and review it before using it with a mint you control.

---

## NFT

The NFT scripts use Metaplex Core through Umi. The image and metadata JSON are uploaded to Irys, and the Core asset stores the metadata URI on-chain.

| Script | Command | What it does |
|---|---|---|
| `nft_image.ts` | `npm run nft:image` | Uploads your image to Irys, logs the image URI |
| `nft_metadata.ts` | `npm run nft:metadata` | Builds the metadata JSON and uploads it, logs the metadata URI |
| `nft_mint.ts` | `npm run nft:mint` | Mints the NFT on-chain using the metadata URI |
| `nft_metadata_updated.ts` | `npx ts-node src/nft/nft_metadata_updated.ts` | Uploads revised metadata JSON |
| `nft_update.ts` | `npx ts-node src/nft/nft_update.ts` | Updates the asset name and URI using the update authority |
| `nft_transfer.ts` | `npx ts-node src/nft/nft_transfer.ts` | Transfers the asset to another wallet |
| `nft_burn.ts` | `npx ts-node src/nft/nft_burn.ts` | Burns the asset using its current owner's keypair |

Run the image, metadata, and mint scripts in order, copying each URI to the next script. To update the asset, upload revised metadata and set the asset address, name, and new URI in `nft_update.ts`. Set your asset and recipient addresses in the transfer script. The burn script reads the recipient keypair from `meowysigma-recipient.json` in the project root and uses the project wallet as fee payer. Keep both wallet files private and ignored by Git.

The addresses in the update, transfer, and burn scripts refer to the completed exercise below. That asset has already been burned, so create another asset and change the addresses if repeating the lifecycle. Burning is permanent.

## How the accounts fit together

- The SPL **mint account** identifies the token and stores its supply, decimal precision, and mint authority. The Token Program owns and modifies this account. The project wallet was the mint authority and signed to create new units.
- An **associated token account** (ATA) holds one owner's balance for one mint. Its address is derived from the wallet, mint, and Token Program. The sender signs to authorize a transfer from its ATA; the recipient wallet is the owner of the destination ATA.
- The ATA Program creates token accounts using cross-program invocations (CPIs) to the System Program and Token Program. The transaction logs for the mint and transfer demonstrate these calls.
- The **Core asset account** records the NFT owner, update authority, name, and metadata URI. The URI is stored on Solana; the JSON and image it points to are retrieved from Irys. Updating the URI changes which JSON applications read.
- The **owner** authorizes the Core transfer and burn in this example. The **update authority** authorizes changes to the name and URI. These are separate roles, even when held by the same wallet.

## Devnet evidence

- Project wallet: `67TTyQLryJYWZxdtz7mejT45YFXhYG72trogtdc3XZTH`
- Recipient wallet: `5oAkWGSaacy85PnoNGxZeoTT9TDsSjmCPsuXeRWs9vp`
- SPL mint: [`743gc2ZDQ8r5DCayQvG9p4CWSuGtUpvpNAtffK8PRdAc`](https://explorer.solana.com/address/743gc2ZDQ8r5DCayQvG9p4CWSuGtUpvpNAtffK8PRdAc?cluster=devnet)
- Core asset: [`96GGyvx7GPBazFeFEBVgbufnQTmU1rjoxWxtvD97EsWC`](https://explorer.solana.com/address/96GGyvx7GPBazFeFEBVgbufnQTmU1rjoxWxtvD97EsWC?cluster=devnet) (burned)

| Action | Transaction |
|---|---|
| Create SPL mint | [Create and initialize mint](https://explorer.solana.com/tx/2CvYLNTptiUDUBshqhjndWqUUmVBrAt7tyqDq67BbgCq1JXkX7yDhDHon4Y9C8y6sg8bfRY7axDLQ859NUNXZDEZ?cluster=devnet) |
| Mint 100 SPL tokens | [Create sender ATA and mint](https://explorer.solana.com/tx/2CPpj7zux3LDNF43jjb412J2rpyf9kRKcTUATJbzSjjGKwJADFXERCzixXduLsNK9J7axJzidSqo5FMPv3cLGuB9?cluster=devnet) |
| Transfer 25 SPL tokens | [Create recipient ATA and transfer](https://explorer.solana.com/tx/4mpDHxpBYuVyHLW8Me6tvPzEfSGYPHuGR8JtDguRJ2YN9x9Jzx76t4RCavrbGCxCppeLgq4LVRsxJ6ien8zqKVno?cluster=devnet) |
| Create NFT | [Create MeowySigma](https://explorer.solana.com/tx/535gBhFVUW36rWL6c5Y3JanQL8HMDdZXZk31xKhrCdzVWDVc6Dzn2UMD8yyTsNqUD9qJwhp7bLCMeHuTTzT7QHwH?cluster=devnet) |
| Update NFT | [Change name and metadata URI](https://explorer.solana.com/tx/5jc1ztQNX6fXzYFqx7qUY3veWrmfnHQBi9TA6Z2p19uBrkRCN8VdktkEy5f8UBQtfUhxWgq472tk378xahr1mzv5?cluster=devnet) |
| Transfer NFT | [Transfer to recipient wallet](https://explorer.solana.com/tx/2taXG7yhBaCDBtpbyTgVi2umSyv6VCmj1gjrCYjqmmncvkk89C5Kpnk3d2g38dvbS4u6mr1rrFKKKQBJzjzkeFED?cluster=devnet) |
| Burn NFT | [Burn and reclaim lamports](https://explorer.solana.com/tx/5bQm6AfWcuCAdYgQk5insANitMeYeD3pkLxwEFtperbppqajW5VgJw8cq3jrDizqYyGaZPpQs37GYYbH8wsjb52F?cluster=devnet) |

The NFT changed from `MeowySigma` with its [original metadata](https://gateway.irys.xyz/8SSZQFRPAmajax598zietSt6ibVXcTyVRmLSZLS6xAh4) to `MeowySigma V2` with [updated metadata](https://gateway.irys.xyz/EdE1MgJ2B3RDU9sJfGz71mvLC9MwEDZiAPiHaf5538fx). The burn returned 792,480 lamports to the fee payer; a one-byte account retained 2,155,320 lamports. The separate transaction fee was 10,000 lamports.

## References

- [Solana token documentation](https://solana.com/docs/tokens)
- [Solana Kit](https://www.solanakit.com/)
- [Metaplex Core documentation](https://www.metaplex.com/docs/smart-contracts/core)
- [Metaplex Token Metadata documentation](https://www.metaplex.com/docs/smart-contracts/token-metadata)
