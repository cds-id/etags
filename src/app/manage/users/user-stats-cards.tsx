import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, UserCheck, Shield, Building2 } from 'lucide-react';

type UserStatsCardsProps = {
  stats: {
    totalUsers: number;
    activeUsers: number;
    adminCount: number;
    brandCount: number;
  };
};

export function UserStatsCards({ stats }: UserStatsCardsProps) {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      <Card className="relative overflow-hidden border-0 bg-linear-to-br from-violet-500/10 via-violet-500/5 to-transparent gap-0 py-0">
        <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Pengguna
          </CardTitle>
          <div className="h-9 w-9 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Users className="h-[18px] w-[18px] text-violet-600 dark:text-violet-400" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">
            {stats.totalUsers}
          </div>
          <CardDescription className="text-xs mt-1">
            Pengguna terdaftar
          </CardDescription>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 bg-linear-to-br from-emerald-500/10 via-emerald-500/5 to-transparent gap-0 py-0">
        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pengguna Aktif
          </CardTitle>
          <div className="h-9 w-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <UserCheck className="h-[18px] w-[18px] text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.activeUsers}
          </div>
          <CardDescription className="text-xs mt-1">Akun aktif</CardDescription>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 bg-linear-to-br from-rose-500/10 via-rose-500/5 to-transparent gap-0 py-0">
        <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Administrator
          </CardTitle>
          <div className="h-9 w-9 rounded-lg bg-rose-500/20 flex items-center justify-center">
            <Shield className="h-[18px] w-[18px] text-rose-600 dark:text-rose-400" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">
            {stats.adminCount}
          </div>
          <CardDescription className="text-xs mt-1">Akun admin</CardDescription>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 bg-linear-to-br from-blue-500/10 via-blue-500/5 to-transparent gap-0 py-0">
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Brand User
          </CardTitle>
          <div className="h-9 w-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Building2 className="h-[18px] w-[18px] text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.brandCount}
          </div>
          <CardDescription className="text-xs mt-1">Akun brand</CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
