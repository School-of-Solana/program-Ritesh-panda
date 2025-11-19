// app/src/components/TweetForm.tsx

import React, { useState } from 'react';
import { useTwitter } from '../hooks/useTwitter';

export const TweetForm: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendTweet, program } = useTwitter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program) {
        alert("Please connect your wallet first.");
        return;
    }

    try {
      setIsSubmitting(true);
      await sendTweet(topic.trim(), content.trim());
      alert('Tweet successfully sent!');
      setTopic('');
      setContent('');
    } catch (error) {
      console.error('Failed to send tweet:', error);
      alert('Failed to send tweet. Check console for details (e.g., wallet not funded).');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Post a New Message</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Topic (Max 50 Chars)</label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value.slice(0, 50))}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            disabled={isSubmitting || !program}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content (Max 280 Chars)</label>
          <textarea
            id="content"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 280))}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            disabled={isSubmitting || !program}
          />
        </div>
        <button
          type="submit"
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${program ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
          disabled={isSubmitting || !program || topic.trim() === '' || content.trim() === ''}
        >
          {isSubmitting ? 'Sending...' : 'Post Message'}
        </button>
      </form>
    </div>
  );
};