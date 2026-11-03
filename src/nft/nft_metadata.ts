import {
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import wallet from "../../devnet-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(
  irysUploader({
    address: "https://devnet.irys.xyz/",
  }),
);

umi.use(signerIdentity(signer));

(async () => {
  try {
    //change the image uri to your image uri obtained from nft_image.ts
    const image = "https://gateway.irys.xyz/9hy5JNLNvjKAfbFWJi3tu57ZxvUYY2VWbru7WRzi9qg6";
      // "https://qfocdcgafdqwcpsww72ogyzyjvwbhmxufhv6xc3uabggoxqfggfq.devnet-1.datasprite-cdn.com/9hy5JNLNvjKAfbFWJi3tu57ZxvUYY2VWbru7WRzi9qg6/";

    //json scheme : https://www.metaplex.com/docs/smart-contracts/core/json-schema
    //change the metadata
    const metadata = {
            name: "MeowySigma",
            description: "MEOWYYY",
            image,
            attributes: [{ trait_type: "Rarity", value: "Legendary" }],
            
            properties: {
                files: [
                    {
                        type: "image/jpg",  
                        uri: image,        
                    },
                ],
                category: "image",      
            },

        };
    const myUri = await umi.uploader.uploadJson(metadata);
    console.log(`metadata uri: ${myUri} `);
  } catch (error) {
    console.log("error", error);
  }
})();
