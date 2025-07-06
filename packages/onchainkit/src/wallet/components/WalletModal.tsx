'use client';

import { Dialog } from '@/internal/components/Dialog';
import { CloseSvg } from '@/internal/svg/closeSvg';
import { coinbaseWalletSvg } from '@/internal/svg/coinbaseWalletSvg';
import { defaultAvatarSVG } from '@/internal/svg/defaultAvatarSVG';
import { frameWalletSvg } from '@/internal/svg/frameWalletSvg';
import { metamaskSvg } from '@/internal/svg/metamaskSvg';
import { phantomSvg } from '@/internal/svg/phantomSvg';
import { rabbySvg } from '@/internal/svg/rabbySvg';
import { trustWalletSvg } from '@/internal/svg/trustWalletSvg';
import { border, cn, pressable, text } from '@/styles/theme';
import { useOnchainKit } from '@/useOnchainKit';
import { useCallback, useContext } from 'react';
import { useConnect } from 'wagmi';
import { coinbaseWallet, injected, metaMask } from 'wagmi/connectors';
import { WalletLocaleContext } from '../WalletLocale';
import { checkWalletAndRedirect } from '../utils/checkWalletAndRedirect';
import { useWalletText } from '../hooks/useWalletText';

type WalletProviderOption = {
  id: string;
  name: string;
  icon: React.ReactNode;
  connector: () => void;
  enabled: boolean;
};

type WalletModalProps = {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  onError?: (error: Error) => void;
  titleText?: string;
  signUpText?: string;
  termsText?: string;
  privacyText?: string;
  continueText?: string;
  connectWalletOnlyText?: string;
  closeButtonAriaLabel?: string;
};

// eslint-disable-next-line complexity
export function WalletModal({
  className,
  isOpen,
  onClose,
  onError,
  titleText,
  signUpText,
  termsText,
  privacyText,
  continueText,
  connectWalletOnlyText,
  closeButtonAriaLabel,
}: WalletModalProps) {
  const { connect } = useConnect();
  const { config } = useOnchainKit();
  const locale = useContext(WalletLocaleContext);

  const modalTitle = useWalletText('walletModalTitle', titleText);
  const modalCloseAriaLabel = useWalletText(
    'walletModalCloseAriaLabel',
    closeButtonAriaLabel,
  );
  const modalDescription = useWalletText('walletModalDescription');
  const modalSignUp = useWalletText('walletModalSignUp', signUpText);
  const modalContinue = useWalletText('walletModalContinue', continueText);
  const modalConnectOnly = useWalletText(
    'walletModalConnectOnly',
    connectWalletOnlyText,
  );
  const modalAgreement = useWalletText('walletModalAgreement');
  const modalTerms = useWalletText('walletModalTerms', termsText);
  const modalAnd = useWalletText('walletModalAnd');
  const modalPrivacy = useWalletText('walletModalPrivacy', privacyText);

  const appLogo = config?.appearance?.logo ?? undefined;
  const appName = config?.appearance?.name ?? undefined;
  const privacyPolicyUrl = config?.wallet?.privacyUrl ?? undefined;
  const termsOfServiceUrl = config?.wallet?.termsUrl ?? undefined;
  const supportedWallets = config?.wallet?.supportedWallets ?? {
    rabby: false,
    trust: false,
    frame: false,
  };
  const isSignUpEnabled = config?.wallet?.signUpEnabled ?? true;

  const handleCoinbaseWalletConnection = useCallback(() => {
    try {
      const cbConnector = coinbaseWallet({
        preference: 'all',
        appName,
        appLogoUrl: appLogo,
      });
      connect({ connector: cbConnector });
      onClose();
    } catch (error) {
      console.error('Coinbase Wallet connection error:', error);
      if (onError) {
        onError(
          error instanceof Error
            ? error
            : new Error('Failed to connect wallet'),
        );
      }
    }
  }, [appName, appLogo, connect, onClose, onError]);

  const handleMetaMaskConnection = useCallback(() => {
    try {
      const metamaskConnector = metaMask({
        dappMetadata: {
          name: appName || 'OnchainKit App',
          url: window.location.origin,
          iconUrl: appLogo,
        },
      });

      connect({ connector: metamaskConnector });
      onClose();
    } catch (error) {
      console.error('MetaMask connection error:', error);
      onError?.(
        error instanceof Error ? error : new Error('Failed to connect wallet'),
      );
    }
  }, [connect, onClose, onError, appName, appLogo]);

  const handlePhantomConnection = useCallback(() => {
    try {
      if (!checkWalletAndRedirect('phantom')) {
        onClose();
        return;
      }

      const phantomConnector = injected({
        target: 'phantom',
      });

      connect({ connector: phantomConnector });
      onClose();
    } catch (error) {
      console.error('Phantom connection error:', error);
      onError?.(
        error instanceof Error ? error : new Error('Failed to connect wallet'),
      );
    }
  }, [connect, onClose, onError]);

  const handleRabbyConnection = useCallback(() => {
    try {
      if (!checkWalletAndRedirect('rabby')) {
        onClose();
        return;
      }

      const rabbyConnector = injected({
        target: 'rabby',
      });

      connect({ connector: rabbyConnector });
      onClose();
    } catch (error) {
      console.error('Rabby connection error:', error);
      onError?.(
        error instanceof Error ? error : new Error('Failed to connect wallet'),
      );
    }
  }, [connect, onClose, onError]);

  const handleTrustWalletConnection = useCallback(() => {
    try {
      if (!checkWalletAndRedirect('trust')) {
        onClose();
        return;
      }

      const trustConnector = injected({
        target: 'trust',
      });

      connect({ connector: trustConnector });
      onClose();
    } catch (error) {
      console.error('Trust Wallet connection error:', error);
      onError?.(
        error instanceof Error ? error : new Error('Failed to connect wallet'),
      );
      onClose();
    }
  }, [connect, onClose, onError]);

  /**
   * Frame wallet doesn't respond properly to injected({ target: 'frame' }) unlike other wallets.
   * Solution: Verify window.ethereum.isFrame first, then use untargeted injected() connector.
   * This ensures the Frame button only connects to Frame wallet.
   */
  const handleFrameWalletConnection = useCallback(() => {
    try {
      if (!window.ethereum?.isFrame) {
        window.open('https://frame.sh/download', '_blank');
        onClose();
        return;
      }

      const frameConnector = injected();
      connect({ connector: frameConnector });
      onClose();
    } catch (error) {
      console.error('Frame Wallet connection error:', error);
      onError?.(
        error instanceof Error ? error : new Error('Failed to connect wallet'),
      );

      onClose();
    }
  }, [connect, onClose, onError]);

  const availableWallets: WalletProviderOption[] = [
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: coinbaseWalletSvg,
      connector: handleCoinbaseWalletConnection,
      enabled: true,
    },
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: metamaskSvg,
      connector: handleMetaMaskConnection,
      enabled: true,
    },
    {
      id: 'phantom',
      name: 'Phantom',
      icon: phantomSvg,
      connector: handlePhantomConnection,
      enabled: true,
    },
    {
      id: 'rabby',
      name: 'Rabby',
      icon: rabbySvg,
      connector: handleRabbyConnection,
      enabled: supportedWallets.rabby === true,
    },
    {
      id: 'trust',
      name: 'Trust Wallet',
      icon: trustWalletSvg,
      connector: handleTrustWalletConnection,
      enabled: supportedWallets.trust === true,
    },
    {
      id: 'frame',
      name: 'Frame',
      icon: frameWalletSvg,
      connector: handleFrameWalletConnection,
      enabled: supportedWallets.frame === true,
    },
  ].filter((wallet) => wallet.enabled);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      aria-label={modalTitle}
      title={modalTitle}
      description={modalDescription}
    >
      <div
        data-testid="ockModalOverlay"
        className={cn(
          border.lineDefault,
          'rounded-ock-default',
          'bg-ock-background',
          'w-[22rem] p-6 pb-4',
          'relative flex flex-col items-center gap-4',
          className,
        )}
      >
        <button
          onClick={onClose}
          className={cn(pressable.default, 'absolute right-4 top-4')}
          aria-label={modalCloseAriaLabel}
        >
          <div className={cn('flex h-4 w-4 items-center justify-center')}>
            <CloseSvg />
          </div>
        </button>
        <div className={cn('flex flex-col items-center justify-center gap-1')}>
          {appName && (
            <span className={cn(text.label1, 'text-ock-foreground-muted')}>
              {appName}
            </span>
          )}
          <h2 className={cn(text.headline, 'text-ock-foreground')}>
            {modalTitle}
          </h2>
        </div>
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-2',
            'w-full',
          )}
        >
          {isSignUpEnabled && (
            <button
              className={cn(
                pressable.default,
                border.lineDefault,
                'bg-ock-background-primary',
                'rounded-ock-lg',
                'flex w-full items-center justify-center gap-2 px-4 py-3',
              )}
            >
              <span className={cn(text.headline, 'text-ock-foreground')}>
                {modalSignUp}
              </span>
              <div className="h-4 w-4">{defaultAvatarSVG}</div>
            </button>
          )}
          <span
            className={cn(
              text.label1,
              'text-ock-foreground-muted',
              'flex items-center gap-2',
              'w-full',
              'before:bg-ock-border-default before:h-px before:w-full before:flex-grow',
              'after:bg-ock-border-default after:h-px after:w-full after:flex-grow',
            )}
          >
            {isSignUpEnabled ? modalContinue : modalConnectOnly}
          </span>
        </div>

        <div
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2',
          )}
        >
          {availableWallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={wallet.connector}
              className={cn(
                pressable.default,
                border.lineDefault,
                'bg-ock-background-primary',
                'rounded-ock-lg',
                'flex w-full items-center justify-start gap-4 px-4 py-3',
              )}
            >
              <div className={cn('h-8 w-8')}>{wallet.icon}</div>
              <span className={cn(text.headline, 'text-ock-foreground')}>
                {wallet.name}
              </span>
            </button>
          ))}
        </div>
        <div className={cn('w-full')}>
          <p
            className={cn(text.label1, 'text-center text-ock-foreground-muted')}
          >
            <span className="font-normal text-[10px] leading-[13px]">
              What is a wallet?
            </span>
          </p>
        </div>
        <div className={cn('w-full')}>
          <p
            className={cn(text.label1, 'text-center text-ock-foreground-muted')}
          >
            <span className="font-normal text-[10px] leading-[13px]">
              {isSignUpEnabled ? modalAgreement : ''}{' '}
              {termsOfServiceUrl && (
                <a
                  href={termsOfServiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn('text-ock-primary', 'hover:underline')}
                  tabIndex={0}
                >
                  {modalTerms}
                </a>
              )}{' '}
              {termsOfServiceUrl && privacyPolicyUrl && ` ${modalAnd} `}{' '}
              {privacyPolicyUrl && (
                <a
                  href={privacyPolicyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn('text-ock-primary', 'hover:underline')}
                  tabIndex={0}
                >
                  {modalPrivacy}
                </a>
              )}
              .
            </span>
          </p>
        </div>
      </div>
    </Dialog>
  );
}
