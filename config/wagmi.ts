import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const connectors = [
  injected(),
  coinbaseWallet({
    appName: 'Milky Way Miner',
  }),
  // WalletConnect is only enabled when a project id is configured
  ...(projectId
    ? [
        walletConnect({
          projectId,
          metadata: {
            name: 'Milky Way Miner',
            description: 'Farcaster Base Idle Miner',
            url: 'https://example.com',
            icons: [],
          },
        }),
      ]
    : []),
];

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors,
});
