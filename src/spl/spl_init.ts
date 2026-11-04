import {
  appendTransactionMessageInstruction,
  appendTransactionMessageInstructions,
  assertIsTransactionMessageWithBlockhashLifetime,
  assertIsTransactionWithBlockhashLifetime,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  generateKeyPairSigner,
  getSignatureFromTransaction,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";
import {
  getInitializeMintInstruction,
  getMintSize,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { getCreateAccountInstruction } from "@solana-program/system";

//import your wallet
import wallet from "../../devnet-wallet.json";

const rpc = createSolanaRpc("https://api.devnet.solana.com");

const rpcSubscriptions = createSolanaRpcSubscriptions(
  "wss://api.devnet.solana.com",
);

(async () => {
  try {
    const signer = await createKeyPairSignerFromBytes(new Uint8Array(wallet));

    if (signer.address !== "67TTyQLryJYWZxdtz7mejT45YFXhYG72trogtdc3XZTH") {
      throw new Error("The loaded wallet is not the project wallet.");
    }

    const mint = await generateKeyPairSigner();
    const space = BigInt(getMintSize());
    const rent = await rpc.getMinimumBalanceForRentExemption(space).send();

    console.log("Project wallet:", signer.address);
    console.log("New mint address:", mint.address);
    console.log("Mint account size:", space.toString(), "bytes");
    console.log("Rent-exempt funding:", rent.toString(), "lamports");

    const createMintAccountIx = getCreateAccountInstruction({
      payer: signer,
      newAccount: mint,
      lamports: rent,
      space,
      programAddress: TOKEN_PROGRAM_ADDRESS,
    });

    const initializeMintIx = getInitializeMintInstruction({
      mint: mint.address,
      decimals: 6,
      mintAuthority: signer.address,
      freezeAuthority: null,
    });

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

    let message = createTransactionMessage({ version: 0 });
    const messageWithPayer = setTransactionMessageFeePayerSigner(signer, message);
    const messageWithLifetime = setTransactionMessageLifetimeUsingBlockhash(
      latestBlockhash,
      messageWithPayer,
    );

    const messageWithInstructions = appendTransactionMessageInstructions(
      [createMintAccountIx, initializeMintIx],
      messageWithLifetime,
    );

    const signedTx = await signTransactionMessageWithSigners(
      messageWithInstructions,
    );

    assertIsTransactionWithBlockhashLifetime(signedTx);

    const signature = getSignatureFromTransaction(signedTx);

    const sendAndConfirm = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions,
    });

    await sendAndConfirm(signedTx, { commitment: "confirmed" });

    console.log("Mint creation transaction:", signature);
  } catch (error) {
    console.log(error);
  }
})();
