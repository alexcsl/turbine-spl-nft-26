import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";
import wallet from "../../devnet-wallet.json";
import {
  createSignerFromKeypair,
  generateSigner,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { fetchAssetV1, update, mplCore } from "@metaplex-foundation/mpl-core";
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

    const asset = await fetchAssetV1(umi, assetAddress);

    console.log("Signer:", signer.publicKey);
    console.log("Before:", {
        name: asset.name,
        uri: asset.uri,
        owner: asset.owner,
        updateAuthority: asset.updateAuthority,
    });

    const tx = await update(umi, {
                        asset,
                        name: "MeowySigma V2",
                        uri: "https://gateway.irys.xyz/EdE1MgJ2B3RDU9sJfGz71mvLC9MwEDZiAPiHaf5538fx",
                        authority: signer,
                        }).sendAndConfirm(umi);

    console.log("Update transaction:", base58.deserialize(tx.signature)[0]);

    const updatedAsset = await fetchAssetV1(umi, assetAddress);
    
    console.log("After:", {
                name: updatedAsset.name,
                uri: updatedAsset.uri,
                owner: updatedAsset.owner,
                updateAuthority: updatedAsset.updateAuthority,
                });
  } catch (e) {
    console.log(`errior ${e}`);
  }
})();
