import { getTicketForBrand } from '@/lib/actions/support-tickets';
import { notFound } from 'next/navigation';
import { TicketDetail } from './ticket-detail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getTicketForBrand(Number(id));

  if (!result.success || !result.ticket) {
    notFound();
  }

  return (
    <TicketDetail ticket={result.ticket} products={result.products || []} />
  );
}
