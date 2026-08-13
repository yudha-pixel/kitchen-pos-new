import type { ReactNode } from 'react';

export function TopNavigation({
  brand,
  left,
  right,
  mobileRow,
}: {
  brand: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  mobileRow?: ReactNode;
}) {
  return (
    <header className="app-shell-header relative z-40 flex flex-col justify-center border-b border-primary bg-primary px-3 text-on-primary sm:px-6 lg:border-line lg:bg-surface lg:text-ink">
      <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-2 py-2">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">{left}</div>
        {brand}
        <div className="flex min-w-0 items-center justify-self-end gap-1.5 sm:gap-2">{right}</div>
      </div>
      {mobileRow && <div className="mb-2 w-full lg:hidden">{mobileRow}</div>}
    </header>
  );
}
