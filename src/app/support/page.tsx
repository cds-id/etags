import { Metadata } from 'next';
import { SupportPageClient } from './support-client';

export const metadata: Metadata = {
  title: 'Support - Etags',
  description: 'Submit support tickets for your products',
};

export default function SupportPage() {
  return <SupportPageClient />;
}
