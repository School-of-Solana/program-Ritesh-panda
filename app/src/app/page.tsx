// app/src/pages/index.tsx (Modify this file)

import { TweetForm } from '../components/TweetForm';
import { TweetList } from '../components/TweetList';
// Assuming the default template wraps content in a Layout or has a main wrapper

export default function Index() {
  return (
    <div>
      {/* Wallet adapter connection components from the template should be here */}
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8">🐦 Decentralized Messaging dApp</h1>
        <TweetForm />
        <TweetList />
      </main>
    </div>
  );
}