// app/src/hooks/useTwitter.tsx

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Keypair } from "@solana/web3.js";
import { useCallback, useMemo, useEffect, useState } from "react";
// Import the IDL and program types
import idl from "../idl/twitter.json";
import { Twitter } from "../idl/twitter"; // Anchor generates this type

// !!! IMPORTANT: REPLACE WITH YOUR DEPLOYED DEVNET PROGRAM ID !!!
const PROGRAM_ID = new PublicKey("Fg6PaFpoGXkPABjJgT841GjE9zP5t7KqT41v6X966A");

// Define the shape of a Tweet account for the frontend
export interface TweetAccount {
  publicKey: PublicKey;
  account: {
    authority: PublicKey;
    timestamp: anchor.BN;
    topic: string;
    content: string;
  };
}

export const useTwitter = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [tweets, setTweets] = useState<TweetAccount[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize the Anchor Program object
  const program = useMemo(() => {
    if (wallet) {
      const provider = new anchor.AnchorProvider(
        connection,
        wallet,
        anchor.AnchorProvider.defaultOptions()
      );
      return new Program<Twitter>(idl as any, PROGRAM_ID, provider);
    }
    return null;
  }, [connection, wallet]);

  // Function to fetch all existing tweets
  const fetchTweets = useCallback(async () => {
    if (program) {
      setLoading(true);
      try {
        const allTweets = await program.account.tweet.all();
        // Sort tweets by timestamp descending
        const sortedTweets = allTweets.sort((a, b) => 
          b.account.timestamp.toNumber() - a.account.timestamp.toNumber()
        ) as TweetAccount[];
        setTweets(sortedTweets);
      } catch (error) {
        console.error("Error fetching tweets:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [program]);

  // Fetch tweets on component mount/wallet change
  useEffect(() => {
    fetchTweets();
  }, [fetchTweets]);

  // Function to send a new tweet
  const sendTweet = useCallback(
    async (topic: string, content: string) => {
      if (!program || !wallet) throw new Error("Wallet not connected or Program not ready.");
      
      const tweetAccount = Keypair.generate(); // New keypair for the tweet's data account

      const tx = await program.methods
        .sendTweet(topic, content)
        .accounts({
          tweet: tweetAccount.publicKey,
          authority: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([tweetAccount])
        .rpc();

      await fetchTweets(); // Refresh the list after sending
      return tx;
    },
    [program, wallet, fetchTweets]
  );

  return {
    program,
    tweets,
    loading,
    sendTweet,
    fetchTweets,
  };
};