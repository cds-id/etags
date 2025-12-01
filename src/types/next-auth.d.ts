import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
    brandId?: string | null;
    onboardingComplete?: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      image?: string | null;
      brandId?: string | null;
      onboardingComplete?: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    brandId?: string | null;
    onboardingComplete?: boolean;
  }
}
