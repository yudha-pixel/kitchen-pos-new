export function getCompanyInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0]?.slice(0, 2) || 'KP').toUpperCase();
}

export function CompanyBrand({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  return (
    <span aria-label={`Perusahaan ${name}`} className="flex min-w-0 max-w-52 items-center justify-center gap-2 px-2 text-center">
      {logoUrl ? (
        // Company logos are runtime-managed API assets, so their dimensions are reserved explicitly.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="size-8 shrink-0 rounded-lg object-contain" width={32} height={32} />
      ) : (
        <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-xs font-semibold text-primary">
          {getCompanyInitials(name)}
        </span>
      )}
      <span className="truncate text-sm font-semibold text-inherit">{name}</span>
    </span>
  );
}
