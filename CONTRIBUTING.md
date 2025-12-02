# Contributing to Etags

Terima kasih atas minat Anda untuk berkontribusi ke Etags! Dokumen ini berisi panduan untuk berkontribusi.

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- Git

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/cds-id/etags.git
cd etags

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Setup database
npm run db:push
npm run db:create-admin

# Run development server
npm run dev
```

## Development Workflow

### Branch Naming

Gunakan format berikut untuk branch:

- `feature/` - Fitur baru (contoh: `feature/wallet-login`)
- `fix/` - Bug fix (contoh: `fix/tag-validation`)
- `bugfix/` - Bug fix alternatif (contoh: `bugfix/auth-redirect`)
- `refactor/` - Refactoring kode
- `docs/` - Dokumentasi
- `test/` - Testing

### Commit Messages

Kami menggunakan [Conventional Commits](https://www.conventionalcommits.org/). Gunakan commitizen untuk membantu:

```bash
npm run commit
```

Format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:

- `feat` - Fitur baru
- `fix` - Bug fix
- `docs` - Dokumentasi
- `style` - Formatting (tidak mengubah logic)
- `refactor` - Refactoring kode
- `test` - Menambah/memperbaiki tests
- `chore` - Maintenance tasks

Contoh:

```
feat(auth): add wallet login for brand users

- Integrate WalletConnect
- Add wallet signature verification
- Support MetaMask and Coinbase Wallet
```

## Code Quality

### Before Submitting

Pastikan kode Anda lolos semua checks:

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Formatting
npm run format

# Tests
npm run test -- --run
```

### Pre-commit Hook

Project ini menggunakan pre-commit hook yang otomatis menjalankan:

- TypeScript type checking
- Prettier formatting pada staged files

### Code Style

- TypeScript untuk semua kode
- Functional components dengan hooks
- Server Actions untuk data mutations
- Prisma untuk database queries
- Tailwind CSS untuk styling

### File Organization

```
src/
├── app/           # Next.js routes
├── components/    # React components
│   ├── ui/        # shadcn/ui components
│   └── shared/    # Shared components
├── lib/           # Business logic
│   ├── actions/   # Server actions
│   └── services/  # Service layer
└── types/         # TypeScript types
```

## Testing

### Running Tests

```bash
# Watch mode
npm run test

# Single run
npm run test -- --run

# With coverage
npm run test -- --coverage
```

### Writing Tests

- Test files: `*.test.ts` atau `*.test.tsx`
- Lokasi: di folder yang sama dengan file yang ditest
- Framework: Vitest + React Testing Library

Contoh test:

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

## Pull Request

### Membuat PR

1. Fork repository
2. Buat branch dari `develop`
3. Commit changes
4. Push ke fork Anda
5. Buat Pull Request ke `develop`

### PR Checklist

- [ ] Code lolos `npm run typecheck`
- [ ] Code lolos `npm run lint`
- [ ] Code sudah diformat dengan Prettier
- [ ] Tests ditambahkan untuk fitur baru
- [ ] Tests lolos `npm run test -- --run`
- [ ] Dokumentasi diupdate jika diperlukan

### PR Description

Jelaskan:

- Apa yang berubah
- Mengapa perubahan diperlukan
- Bagaimana cara test perubahan

## Issues

### Reporting Bugs

Saat melaporkan bug, sertakan:

- Deskripsi bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (jika ada)
- Environment (OS, browser, Node version)

### Feature Requests

Untuk request fitur baru:

- Jelaskan use case
- Jelaskan solusi yang diharapkan
- Alternatif yang sudah dipertimbangkan

## Questions?

Jika ada pertanyaan:

- Buat issue dengan label `question`
- Atau hubungi maintainers

## License

Dengan berkontribusi, Anda setuju bahwa kontribusi Anda akan dilisensikan di bawah MIT License.
