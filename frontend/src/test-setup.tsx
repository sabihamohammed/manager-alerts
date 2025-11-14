import { afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Load all jest-dom matchers correctly
import '@testing-library/jest-dom/vitest';

afterEach(() => cleanup());

// Helper for React Query
export function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      {ui}
    </QueryClientProvider>
  );
}
