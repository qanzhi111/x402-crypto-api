# x402 Crypto API - AI Agent Paid Data Service

AI Agent-oriented paid API providing crypto prices, Web3 security data, and on-chain investigation reports via the [x402 payment protocol](https://x402.org).

## Endpoints & Pricing

| Endpoint | Price | Description |
|----------|-------|-------------|
| `GET /api/crypto/price/:symbol` | $0.01 | Real-time cryptocurrency price |
| `GET /api/crypto/market` | $0.02 | Top 20 crypto market overview |
| `GET /api/crypto/address/:address` | $0.05 | Ethereum address analysis |
| `GET /api/security/token/:address` | $0.05 | Token security & rug pull check |
| `GET /api/security/contract/:address` | $0.10 | Smart contract risk analysis |
| `GET /api/investigate/:address` | $0.25 | Full on-chain investigation report |

## Free Endpoints

- `GET /` - API info and endpoint listing
- `GET /health` - Service health check
- `GET /api/status` - API status and pricing

## Payment

All paid endpoints use the **x402 protocol** with **USDC on Base**.

- Payment wallet: `0x801B27e126d91D99A70cd31ffc8BC867B329023D`
- Network: Base (Chain ID: 8453)
- Asset: USDC

## How It Works

1. Client sends request to paid endpoint
2. Server responds with HTTP 402 + payment details
3. Client signs USDC payment via x402
4. Client resends request with X-PAYMENT header
5. Server verifies payment and returns data

## Quick Start

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

# Run locally
node server.js
```

## Deployment

This service is deployed on Railway. To deploy your own instance:

1. Fork this repository
2. Create a new Railway project
3. Connect your GitHub repo
4. Set the environment variable `WALLET_ADDRESS` to your Base chain wallet address
5. Deploy!

## Revenue Potential

At $0.01-$0.25 per call:
- 100 calls/day → ~$5-25/day → $150-750/month
- 1,000 calls/day → ~$50-250/day → $1,500-7,500/month
- 10,000 calls/day → ~$500-2,500/day → $15,000-75,000/month

## Data Sources

- **CoinGecko** - Crypto prices and market data (free tier: 30 calls/min)
- **Etherscan** - On-chain data (free tier: 100K calls/day)

## License

MIT
// Auto-deployed on Railway with x402 Bazaar extension
