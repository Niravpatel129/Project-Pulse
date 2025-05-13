import { useParams } from 'next/navigation';

export default function ReceiptPage() {
  const params = useParams();
  const id = params.id as string;

  return <div>Receipts placeholder page: {id}</div>;
}
