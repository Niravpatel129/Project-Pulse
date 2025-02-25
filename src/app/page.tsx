import Link from 'next/link';

export default function Home() {
  return (
    <div className='flex items-center justify-center min-h-screen font-[family-name:var(--font-geist-sans)] bg-white'>
      <Link
        href={`/projects/${123}`}
        className='text-lg font-medium rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent px-6 py-3'
      >
        Go to Project Page
      </Link>
    </div>
  );
}
