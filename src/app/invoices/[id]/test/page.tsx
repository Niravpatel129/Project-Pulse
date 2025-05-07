export default function TestPage({ params }: { params: { id: string } }) {
  return (
    <div className='p-8'>
      <h1 className='text-2xl font-bold'>Test Page</h1>
      <p>Invoice ID: {params.id}</p>
    </div>
  );
}
