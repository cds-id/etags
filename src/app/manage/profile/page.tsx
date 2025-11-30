import { getProfile } from '@/lib/actions/profile';
import { redirect } from 'next/navigation';
import { ProfileForm } from './profile-form';
import { PasswordForm } from './password-form';
import { AvatarForm } from './avatar-form';

export default async function ProfilePage() {
  const user = await getProfile();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <ProfileForm user={{ name: user.name, email: user.email }} />
          <PasswordForm />
        </div>
        <div>
          <AvatarForm user={{ name: user.name, avatar_url: user.avatar_url }} />
        </div>
      </div>
    </div>
  );
}
