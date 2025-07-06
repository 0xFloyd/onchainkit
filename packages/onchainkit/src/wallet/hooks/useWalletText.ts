import { useContext } from 'react';
import { WalletLocaleContext, type WalletTextKey } from '../WalletLocale';

export function useWalletText(key: WalletTextKey, override?: string): string {
  const locale = useContext(WalletLocaleContext);
  return override ?? locale[key];
}
