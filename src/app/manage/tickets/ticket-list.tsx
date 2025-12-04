'use client';

import { useState, useMemo } from 'react';
import {
  StatsCards,
  TicketFilter,
  TicketCard,
  EmptyState,
  TicketListItem,
} from './components';

interface TicketListProps {
  initialTickets: TicketListItem[];
}

export function TicketList({ initialTickets }: TicketListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Memoized filtered tickets
  const filteredTickets = useMemo(() => {
    if (statusFilter === 'all') return initialTickets;
    return initialTickets.filter((ticket) => ticket.status === statusFilter);
  }, [initialTickets, statusFilter]);

  // Memoized stats
  const stats = useMemo(
    () => ({
      open: initialTickets.filter((t) => t.status === 'open').length,
      inProgress: initialTickets.filter((t) => t.status === 'in_progress')
        .length,
      resolved: initialTickets.filter((t) => t.status === 'resolved').length,
      total: initialTickets.length,
    }),
    [initialTickets]
  );

  return (
    <div className="space-y-6">
      <StatsCards
        openCount={stats.open}
        inProgressCount={stats.inProgress}
        resolvedCount={stats.resolved}
        totalCount={stats.total}
      />

      <TicketFilter
        value={statusFilter}
        onChange={setStatusFilter}
        filteredCount={filteredTickets.length}
        totalCount={stats.total}
      />

      {filteredTickets.length === 0 ? (
        <EmptyState statusFilter={statusFilter} />
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
