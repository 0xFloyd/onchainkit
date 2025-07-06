import React, { createContext, useEffect, useMemo } from 'react';

// Default text for all wallet UI strings
export const defaultWalletTexts = {
  connectWalletButton: 'Connect Wallet',
  walletModalTitle: 'Connect Wallet',
  walletModalDescription: 'Connect wallet',
  walletModalClose: 'Close modal',
  walletModalCloseAriaLabel: 'Close connect wallet modal',
  walletModalSignUp: 'Sign up',
  walletModalContinue: 'or continue with an existing wallet',
  walletModalConnectOnly: 'Connect your wallet',
  walletModalAgreement: 'By connecting a wallet, you agree to our',
  walletModalAnd: 'and',
  walletModalTerms: 'Terms of Service',
  walletModalPrivacy: 'Privacy Policy',
  walletDropdownWallet: 'Wallet',
  walletDropdownFund: 'Fund wallet',
  walletDropdownDisconnect: 'Disconnect',
  walletDropdownProfile: 'Profile',
  walletDropdownClaim: 'Claim Basename',
  walletDropdownNew: 'NEW',
} as const;

export type WalletTextKey = keyof typeof defaultWalletTexts;
export type WalletTextOverrides = Partial<Record<WalletTextKey, string>>;

export const WalletLocaleContext =
  createContext<Record<WalletTextKey, string>>(defaultWalletTexts);

/**
 * WalletLocaleProvider allows developers to override wallet UI text.
 * Supply a `texts` prop with any keys from defaultWalletTexts to replace their values.
 */
export function WalletLocaleProvider({
  children,
  texts = {},
}: {
  children: React.ReactNode;
  texts?: WalletTextOverrides;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    for (const key in texts) {
      if (!Object.prototype.hasOwnProperty.call(defaultWalletTexts, key)) {
        console.warn(
          `OnchainKit: Unknown key "${key}" passed to WalletLocaleProvider.`,
        );
      }
    }
  }, [texts]);

  // Merge custom overrides with defaults (forward-compatible with new keys)
  const mergedTexts = useMemo(
    () => ({ ...defaultWalletTexts, ...texts }),
    [texts],
  );

  return (
    <WalletLocaleContext.Provider value={mergedTexts}>
      {children}
    </WalletLocaleContext.Provider>
  );
}
