import { useContext } from 'react';
import { WalletLocaleContext, type WalletTextKey, defaultWalletTexts } from '../WalletLocale';

export function useWalletText(key: WalletTextKey, override?: string): string {
  const locale = useContext(WalletLocaleContext);
  // If no context is provided (e.g., in tests), fall back to default texts
  return override ?? locale?.[key] ?? defaultWalletTexts[key];
}
