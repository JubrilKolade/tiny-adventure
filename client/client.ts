import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import type { TinyAdventure } from "../target/types/tiny_adventure";

// Configure the client to use the local cluster
anchor.setProvider(anchor.AnchorProvider.env());

const program = anchor.workspace.TinyAdventure as anchor.Program<TinyAdventure>;

// Client

// The PDA adress everyone will be able to control the character if the interact with your program
const [globalLevel1GameDataAccount] =
  anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("level1", "utf8")],
    //[program.provider.publicKey.toBuffer()], <- You could also add the player wallet as a seed, then you would have one instance per player. Need to also change the seed in the rust part
    program.programId
  );

let txHash;
let gameDateAccount;
try {
  gameDateAccount = await program.account.gameDataAccount.fetch(
    globalLevel1GameDataAccount
  );
} catch {
  // Check if the account is already initialized, other wise initilalize it
  txHash = await program.methods
    .initialize()
    .accounts({
      newGameDataAccount: globalLevel1GameDataAccount,
      signer: program.provider.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .signers([program.provider.wallet.payer])
    .rpc();

  await logTransaction(txHash);
  console.log("A journey begins...");
  console.log("o........");
}

// Here you can play around now, move left and right
txHash = await program.methods
  //.moveLeft()
  .moveRight()
  .accounts({
    gameDataAccount: globalLevel1GameDataAccount,
  })
  .signers([program.provider.wallet.payer])
  .rpc();
await logTransaction(txHash);

gameDateAccount = await program.account.gameDataAccount.fetch(
  globalLevel1GameDataAccount
);

console.log("Player position is:", gameDateAccount.playerPosition.toString());

switch (gameDateAccount.playerPosition) {
  case 0:
    console.log("A journey begins...");
    console.log("o........");
    break;
  case 1:
    console.log("....o....");
    break;
  case 2:
    console.log("......o..");
    break;
  case 3:
    console.log(".........\\o/");
    break;
}

async function logTransaction(txHash) {
  const { blockhash, lastValidBlockHeight } =
    await program.provider.connection.getLatestBlockhash();

  await program.provider.connection.confirmTransaction({
    blockhash,
    lastValidBlockHeight,
    signature: txHash,
  });

  console.log(
    `Solana Explorer: https://explorer.solana.com/tx/${txHash}?cluster=devnet`
  );
}