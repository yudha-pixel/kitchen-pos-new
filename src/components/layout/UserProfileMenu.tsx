'use client';

import { useState } from 'react';
import { Menu } from '@base-ui/react/menu';
import { ChevronDown, LogOut, UserCog, UserRound } from 'lucide-react';
import type { AuthenticatedUser } from '@/src/types/auth';
import { UserProfileModal } from '@/src/components/profile/UserProfileModal';

interface UserProfileMenuProps {
  user: AuthenticatedUser;
  onLogout: () => void;
}

export function getProfileInitials(fullName: string | undefined, username: string): string {
  const source = fullName?.trim() || username.trim();
  const words = source.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toLocaleUpperCase('id-ID');
  }

  return source.slice(0, 2).toLocaleUpperCase('id-ID');
}

export function formatRoleLabel(role: string): string {
  return role
    .split(/[_-]+/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toLocaleUpperCase('id-ID')}${word.slice(1).toLocaleLowerCase('id-ID')}`)
    .join(' ');
}

export function UserProfileMenu({ user, onLogout }: UserProfileMenuProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const displayName = user.full_name?.trim() || user.username;
  const initials = getProfileInitials(displayName, user.username);
  const roleLabel = formatRoleLabel(user.role);

  return (
    <>
      <Menu.Root>
        <Menu.Trigger
          aria-label={`Buka profil pengguna ${displayName}`}
          className="flex min-h-11 min-w-11 max-w-52 items-center justify-center gap-2 rounded-lg text-on-primary outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-on-primary focus-visible:ring-offset-2 focus-visible:ring-offset-primary lg:px-2 lg:text-ink-secondary lg:hover:bg-surface-alt lg:focus-visible:ring-primary lg:focus-visible:ring-offset-surface"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface/15 text-xs font-semibold text-on-primary lg:bg-primary-soft lg:text-primary">
            {initials || <UserRound className="size-4" aria-hidden="true" />}
          </span>
          <span className="hidden min-w-0 text-left xl:block">
            <span className="block truncate text-sm font-medium">{displayName}</span>
            <span className="block truncate text-xs text-ink-muted">{roleLabel}</span>
          </span>
          <ChevronDown className="hidden size-4 shrink-0 xl:block" aria-hidden="true" />
        </Menu.Trigger>

        <Menu.Portal>
          <Menu.Positioner sideOffset={8} align="end" className="z-50">
            <Menu.Popup
              aria-label="Profil pengguna"
              className="w-64 rounded-xl border border-line bg-surface p-2 text-ink shadow-lg outline-none"
            >
              <div className="px-3 py-2">
                <p className="truncate text-sm font-semibold text-ink">{displayName}</p>
                <p className="truncate text-xs text-ink-muted">@{user.username}</p>
                <p className="mt-1 text-xs text-ink-secondary">{roleLabel}</p>
              </div>
              <Menu.Separator className="my-1 h-px bg-line" />
              <Menu.Item
                onClick={() => setIsModalOpen(true)}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium text-ink outline-none hover:bg-surface-alt focus:bg-surface-alt"
              >
                <UserCog className="size-4 text-ink-muted" aria-hidden="true" />
                Pengaturan Profil
              </Menu.Item>
              <Menu.Item
                onClick={onLogout}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium text-danger outline-none hover:bg-danger-soft focus:bg-danger-soft"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Keluar
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <UserProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
