import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Sample Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });

  it('should render a component', () => {
    render(<div data-testid="test">Hello World</div>);
    expect(screen.getByTestId('test')).toBeDefined();
    expect(screen.getByText('Hello World')).toBeDefined();
  });
});
