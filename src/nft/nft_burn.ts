import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";
import wallet from "../../devnet-wallet.json";
import {
  createSignerFromKeypair,
  generateSigner,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { fetchAssetV1, burn, mplCore } from "@metaplex-foundation/mpl-core";
import { base58 } from "@metaplex-foundation/umi/serializers";
// reading recipient keypair imports
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

umi.use(mplCore());

(async () => {
  try {
    const assetAddress = publicKey(
      "96GGyvx7GPBazFeFEBVgbufnQTmU1rjoxWxtvD97EsWC",
    );

    const recipientKeypairPath = "meowysigma-recipient.json";

    const recipientSecret = JSON.parse(
      readFileSync(recipientKeypairPath, "utf8"),
    );

    const recipientKeypair = umi.eddsa.createKeypairFromSecretKey(
      new Uint8Array(recipientSecret),
    );

    const recipientSigner = createSignerFromKeypair(umi, recipientKeypair);
    const asset = await fetchAssetV1(umi, assetAddress);

    console.log("Asset owner:", asset.owner);
    console.log("Burn authority:", recipientSigner.publicKey);
    console.log("Fee payer:", signer.publicKey);

    if (asset.owner !== recipientSigner.publicKey) {
      throw new Error("Recipient wallet is not the current asset owner");
    }

    const tx = await burn(umi, {
      asset,
      authority: recipientSigner,
    }).sendAndConfirm(umi);

    console.log("Burn transaction:", base58.deserialize(tx.signature)[0]);
  } catch (e) {
    console.log(`errior ${e}`);
  }
})();
