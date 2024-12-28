import assert from "assert";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import type { TinyAdventure } from "../target/types/tiny_adventure";

describe("Test", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.TinyAdventure as anchor.Program<TinyAdventure>;
  
  it("Initlialize", async () => {
    const [newGameDataAccount] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("level1", "utf8")],
      program.programId
    );

    // If account is null we initialize
    try {
      await program.account.gameDataAccount.fetch(newGameDataAccount);
    } catch {
      const txHash = await program.methods
        .initialize()
        .accounts({
          newGameDataAccount: newGameDataAccount,
          signer: program.provider.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([program.provider.wallet.payer])
        .rpc();

      console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
      await program.provider.connection.confirmTransaction(txHash);
    }
  });

  it("RunningRight", async () => {
    const [newGameDataAccount] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("level1", "utf8")],
      program.programId
    );

    for (let i = 0; i < 3; i++) {
      const txHash = await program.methods
        .moveRight()
        .accounts({
          gameDataAccount: newGameDataAccount,
        })
        .signers([program.provider.wallet.payer])
        .rpc();
      console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
      await program.provider.connection.confirmTransaction(txHash);
    }

    // Fetch the created account
    const gameDateAccount = await program.account.gameDataAccount.fetch(
      newGameDataAccount
    );

    console.log(
      "Player position is:",
      gameDateAccount.playerPosition.toString()
    );

    // Check whether the data on-chain is equal to local 'data'
    assert(3 == gameDateAccount.playerPosition);
  });

  it("RunningLeft", async () => {
    const [newGameDataAccount] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("level1", "utf8")],
      program.programId
    );

    for (let i = 0; i < 3; i++) {
      const txHash = await program.methods
        .moveLeft()
        .accounts({
          gameDataAccount: newGameDataAccount,
        })
        .rpc();
      console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
      await program.provider.connection.confirmTransaction(txHash);
    }

    // Fetch the created account
    const gameData = await program.account.gameDataAccount.fetch(
      newGameDataAccount
    );

    console.log("Player position is:", gameData.playerPosition.toString());

    // Check whether the data on-chain is equal to local 'data'
    assert(0 == gameData.playerPosition);
  });
});
