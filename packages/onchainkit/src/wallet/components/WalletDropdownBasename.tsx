'use client';

import { useName } from '@/identity/hooks/useName';
import { Spinner } from '@/internal/components/Spinner';
import { basenameSvg } from '@/internal/svg/basenameSvg';
import { base } from 'viem/chains';
import { useAccount } from 'wagmi';
import { cn, pressable, text } from '../../styles/theme';
import { useContext } from 'react';
import { WalletLocaleContext } from '../WalletLocale';
import { useWalletText } from '../hooks/useWalletText';

export type WalletDropdownBasenameProps = {
  /** Optional className override for the element */
  className?: string;
  profileText?: string;
  claimText?: string;
  newBadgeText?: string;
};

export function WalletDropdownBasename({
  className,
  profileText,
  claimText,
  newBadgeText,
}: WalletDropdownBasenameProps) {
  const { address } = useAccount();
  const locale = useContext(WalletLocaleContext);
  const profileLabel = useWalletText('walletDropdownProfile', profileText);
  const claimLabel = useWalletText('walletDropdownClaim', claimText);
  const newLabel = useWalletText('walletDropdownNew', newBadgeText);

  if (!address) {
    return null;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: basename, isLoading } = useName({
    address,
    chain: base,
  });

  const hasBaseUserName = !!basename;
  const title = hasBaseUserName ? profileLabel : claimLabel;
  const href = hasBaseUserName
    ? `https://www.base.org/name/${basename}`
    : 'https://www.base.org/names';

  return (
    <a
      className={cn(
        pressable.default,
        'text-ock-foreground',
        'relative flex items-center px-4 py-3',
        className,
      )}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="-translate-y-1/2 absolute top-1/2 left-4 flex h-[1.125rem] w-[1.125rem] items-center justify-center">
        {basenameSvg}
      </div>
      <div className="flex w-full items-center pl-6">
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <span className={cn(text.body)}>{title}</span>
            {!hasBaseUserName && (
              <span
                className={cn(
                  'ml-2 rounded-full bg-[#E0E7FF] px-2 py-0.5 text-center font-bold font-sans text-[#4F46E5] text-[0.6875rem] uppercase leading-none',
                )}
              >
                {newLabel}
              </span>
            )}
          </>
        )}
      </div>
    </a>
  );
}
