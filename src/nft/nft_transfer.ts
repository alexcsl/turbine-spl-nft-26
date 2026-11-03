import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";
import wallet from "../../devnet-wallet.json";
import {
  createSignerFromKeypair,
  generateSigner,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { fetchAssetV1, transfer, mplCore } from "@metaplex-foundation/mpl-core";
import { base58 } from "@metaplex-foundation/umi/serializers";

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

    const recipient = publicKey(
      "5oAkWGSaacy85PnoNGxZeoTT9TDsSjmCPsuXeRWs9vp",
    );

    const asset = await fetchAssetV1(umi, assetAddress);

    console.log("Current owner:", asset.owner);
    console.log("Recipient:", recipient);
    console.log("Signer:", signer.publicKey);

    const tx = await transfer(umi, {
      asset,
      newOwner: recipient,
      authority: signer,
    }).sendAndConfirm(umi);

    console.log("Transfer transaction:", base58.deserialize(tx.signature)[0]);
  } catch (e) {
    console.log(`errior ${e}`);
  }
})();
