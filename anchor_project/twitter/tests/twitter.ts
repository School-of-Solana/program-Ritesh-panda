import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Twitter } from "../target/types/twitter";
import * as assert from "assert";

describe("twitter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Twitter as Program<Twitter>;

  it("can send a new tweet", async () => {
    // Generate a new keypair for the tweet account
    const tweetAccount = anchor.web3.Keypair.generate();
    const topic = "solana";
    const content = "Just setting up my dApp Twitter clone on Solana!";

    // Call the send_tweet instruction
    await program.methods
      .sendTweet(topic, content)
      .accounts({
        tweet: tweetAccount.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([tweetAccount])
      .rpc();

    // Fetch the account and check its data
    const tweet = await program.account.tweet.fetch(tweetAccount.publicKey);

    // Assertions
    assert.equal(tweet.authority.toBase58(), provider.wallet.publicKey.toBase58());
    assert.equal(tweet.topic, topic);
    assert.equal(tweet.content, content);
    assert.ok(tweet.timestamp); 
  });

  it("fails when content is too long", async () => {
    const tweetAccount = anchor.web3.Keypair.generate();
    const topic = "test";
    // Content is 281 characters long, max is 280 in lib.rs
    const content = "a".repeat(281);

    try {
      await program.methods
        .sendTweet(topic, content)
        .accounts({
          tweet: tweetAccount.publicKey,
          authority: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([tweetAccount])
        .rpc();
      assert.fail("The transaction should have failed.");
    } catch (err) {
      const expectedError = anchor.AnchorError.parse(err.logs);
      assert.equal(expectedError.error.errorCode.code, "ContentTooLong");
    }
  });

  // Test to fetch all tweets (demonstrates how to query data)
  it("can fetch all tweets", async () => {
    // Note: You must run `anchor test` on a fresh local ledger (`anchor localnet`) 
    // to reliably check the number of accounts.
    const tweets = await program.account.tweet.all();
    assert.ok(tweets.length > 0); // Check that at least one tweet exists
  });
});