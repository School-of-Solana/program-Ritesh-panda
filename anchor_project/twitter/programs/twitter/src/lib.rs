use anchor_lang::prelude::*;

declare_id!("GxPyspDWU841U6iBaGyota1aZooLo7V25gPxeB4ercZE");

// --- Constants for Tweet constraints ---
const TOPIC_MAX_LENGTH: usize = 50;
const CONTENT_MAX_LENGTH: usize = 280;
const DISCRIMINATOR_LENGTH: usize = 8;
// Calculation for space: Discriminator (8) + Pubkey (32) + Timestamp (8) + Topic String (4 + 50) + Content String (4 + 280) = 332
const TWEET_ACCOUNT_SIZE: usize = DISCRIMINATOR_LENGTH + 32 + 8 + (4 + TOPIC_MAX_LENGTH) + (4 + CONTENT_MAX_LENGTH);

#[program]
pub mod twitter {
    use super::*;

    /// Sends a new tweet to the Solana ledger.
    pub fn send_tweet(ctx: Context<SendTweet>, topic: String, content: String) -> Result<()> {
        // --- Input Validation ---
        if topic.chars().count() > TOPIC_MAX_LENGTH {
            return Err(ErrorCode::TopicTooLong.into());
        }
        if content.chars().count() > CONTENT_MAX_LENGTH {
            return Err(ErrorCode::ContentTooLong.into());
        }
        if topic.trim().is_empty() {
            return Err(ErrorCode::TopicCannotBeEmpty.into());
        }
        if content.trim().is_empty() {
            return Err(ErrorCode::ContentCannotBeEmpty.into());
        }

        let tweet = &mut ctx.accounts.tweet;
        let authority = &ctx.accounts.authority;
        let clock = Clock::get().unwrap();

        // --- Populate the tweet account ---
        tweet.authority = authority.key();
        tweet.timestamp = clock.unix_timestamp;
        tweet.topic = topic;
        tweet.content = content;

        Ok(())
    }
}

// --- Accounts Structs ---
#[derive(Accounts)]
pub struct SendTweet<'info> {
    #[account(
        init, // Initialize a new account
        payer = authority, // The payer for the account creation rent
        space = TWEET_ACCOUNT_SIZE, // The space required for the Tweet data struct
    )]
    pub tweet: Account<'info, Tweet>,
    #[account(mut)]
    pub authority: Signer<'info>, // The sender's wallet, who must sign the transaction
    pub system_program: Program<'info, System>, // The System Program needed for account creation
}

// --- Data Structs ---
#[account]
pub struct Tweet {
    pub authority: Pubkey, // The account that authored the tweet
    pub timestamp: i64,    // The timestamp when the tweet was created
    pub topic: String,     // The topic of the tweet (max 50 chars)
    pub content: String,   // The content of the tweet (max 280 chars)
}

// --- Error Codes ---
#[error_code]
pub enum ErrorCode {
    #[msg("The provided topic should not be empty.")]
    TopicCannotBeEmpty,
    #[msg("The provided content should not be empty.")]
    ContentCannotBeEmpty,
    #[msg("The provided topic is too long.")]
    TopicTooLong,
    #[msg("The provided content is too long.")]
    ContentTooLong,
}