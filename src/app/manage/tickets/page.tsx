import { getBrandTickets, getTicketStats } from '@/lib/actions/support-tickets';
import { TicketList } from './ticket-list';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default async function TicketsPage() {
  const [ticketsResult, statsResult] = await Promise.all([
    getBrandTickets(),
    getTicketStats(),
  ]);

  const stats = statsResult.stats || {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  };

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Support Tickets</h1>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-yellow-700">Open</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {stats.open}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-700">In Progress</p>
                <p className="text-2xl font-bold text-blue-700">
                  {stats.inProgress}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-700">Resolved</p>
                <p className="text-2xl font-bold text-green-700">
                  {stats.resolved}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TicketList initialTickets={ticketsResult.tickets || []} />
    </div>
  );
}
