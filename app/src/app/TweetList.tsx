// app/src/components/TweetList.tsx

import React from 'react';
import { useTwitter, TweetAccount } from '../hooks/useTwitter';

const TweetItem: React.FC<{ tweet: TweetAccount }> = ({ tweet }) => {
  const { authority, timestamp, topic, content } = tweet.account;
  // Convert Anchor BN timestamp (seconds) to JS Date (milliseconds)
  const time = new Date(timestamp.toNumber() * 1000).toLocaleString();

  // Helper to shorten pubkey display
  const shortKey = (key: string) => key.slice(0, 4) + '...' + key.slice(-4);

  return (
    <div className="p-4 border-b last:border-b-0">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg text-blue-600">#{topic}</h3>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
      <p className="text-gray-800 my-2">{content}</p>
      <p className="text-sm text-gray-600">
        Posted by: <span className="font-mono text-xs">{shortKey(authority.toBase58())}</span>
      </p>
    </div>
  );
};

export const TweetList: React.FC = () => {
  const { tweets, loading, fetchTweets, program } = useTwitter();

  if (!program) {
    return <div className="text-center p-8 text-gray-500">Please connect your wallet to view and send messages.</div>;
  }

  return (
    <div className="p-4 border rounded-lg shadow-md max-w-lg mx-auto mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Latest Messages</h2>
        <button
          onClick={fetchTweets}
          disabled={loading}
          className="text-sm text-blue-500 hover:text-blue-700 disabled:text-gray-400"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && tweets.length === 0 ? (
        <p className="text-center text-gray-500">Loading messages...</p>
      ) : tweets.length === 0 ? (
        <p className="text-center text-gray-500">No messages found yet. Be the first to post!</p>
      ) : (
        <div>
          {tweets.map((tweet) => (
            <TweetItem key={tweet.publicKey.toBase58()} tweet={tweet} />
          ))}
        </div>
      )}
    </div>
  );
};