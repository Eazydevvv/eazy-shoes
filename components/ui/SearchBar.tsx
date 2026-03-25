'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        type="text"
        placeholder="Search shoes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full md:w-64 px-4 py-2 rounded-full border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none text-sm"
      />
      <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
        🔍
      </button>
    </form>
  );
}