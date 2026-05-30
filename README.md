# x402 Crypto API

![x402 Protocol](https://img.shields.io/badge/x402-Protocol-7C3AED?style=flat-square)
![USDC Payments](https://img.shields.io/badge/USDC-Base-0052FF?style=flat-square)
![Price: $0.01/req](https://img.shields.io/badge/Price-$0.01/request-10B981?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-18+-black?style=flat-square)

**AI Agent Paid Data Service** - Pay-per-request crypto prices, Web3 security data, and on-chain investigation reports via the [x402 payment protocol](https://x402.org).

## Live Demo

> **API Status**: Live at `https://spectacular-strength-production-0494.up.railway.app`

## Endpoints & Pricing

| Endpoint | Price | Description |
|----------|-------|-------------|
| `GET /api/crypto/price/:symbol` | $0.01 | Real-time cryptocurrency price |
| `GET /api/crypto/market` | $0.02 | Top 20 crypto market overview |
| `GET /api/crypto/address/:address` | $0.05 | Ethereum address analysis |
| `GET /api/security/token/:address` | $0.05 | Token security & rug pull check |
| `GET /api/security/contract/:address` | $0.10 | Smart contract risk analysis |
| `GET /api/investigate/:address` | $0.25 | Full on-chain investigation report |

### Free Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | API info and endpoint listing |
| `GET /health` | Service health check |
| `GET /api/status` | API status and pricing |

## Quick Start

### cURL

```bash
# Check API status (free)
curl https://spectacular-strength-production-0494.up.railway.app/health

# Get BTC price (requires x402 payment)
curl https://spectacular-strength-production-0494.up.railway.app/api/crypto/price/BTC
```

### Python

```python
import requests

# Free endpoint
health = requests.get("https://spectacular-strength-production-0494.up.railway.app/health")
print(health.json())

# Paid endpoint (with x402 payment headers)
headers = {
    "X-Payment": "your-x402-payment-header"
}
response = requests.get(
    "https://spectacular-strength-production-0494.up.railway.app/api/crypto/price/BTC",
    headers=headers
)
print(response.json())
```

### JavaScript

```javascript
const axios = require('axios');

// Free endpoint
const health = await axios.get('https://spectacular-strength-production-0494.up.railway.app/health');
console.log(health.data);

// Paid endpoint
const btc = await axios.get(
  'https://spectacular-strength-production-0494.up.railway.app/api/crypto/price/BTC',
  {
    headers: {
      'X-Payment': 'your-x402-payment-header'
    }
  }
);
console.log(btc.data);
```

## Payment

All paid endpoints use the **x402 protocol** with **USDC on Base**.

| Detail | Value |
|--------|-------|
| Payment wallet | `0x801B27e126d91D99A70cd31ffc8BC867B329023D` |
| Network | Base (Chain ID: 8453) |
| Asset | USDC |

### How x402 Works

1. Client sends request to paid endpoint
2. Server responds with `HTTP 402` + payment details
3. Client signs USDC payment via x402
4. Client resends request with `X-Payment` header
5. Server verifies payment and returns data

## Deployment

### Railway (Recommended)

1. Fork this repository
2. Create a new Railway project
3. Connect your GitHub repo
4. Set `WALLET_ADDRESS` to your Base chain wallet
5. Deploy!

### Docker

```bash
docker build -t x402-crypto-api .
docker run -p 3000:3000 -e WALLET_ADDRESS=your_address x402-crypto-api
```

### Local Development

```bash
npm install
cp .env.example .env
# Edit .env with your API keys
npm start
```

## Revenue Potential

At $0.01-$0.25 per call:

| Daily Calls | Daily Revenue | Monthly Revenue |
|-------------|---------------|------------------|
| 100 | $5-25 | $150-750 |
| 1,000 | $50-250 | $1,500-7,500 |
| 10,000 | $500-2,500 | $15,000-75,000 |

## Data Sources

| Source | Data Type | Free Tier |
|--------|-----------|-----------|
| **CoinGecko** | Crypto prices & market data | 30 calls/min |
| **Etherscan** | On-chain data | 100K calls/day |

## Available On

- [AgenticTrade](https://agentictrade.com) - AI Agent trading platform
- [Agent402](https://agent402.ai) - x402 payment gateway
- [x402Scout](https://x402scout.com) - Crypto analytics

---

<p align="center">
  <strong>Powered by x402</strong><br>
  <a href="https://x402.org">x402 Protocol</a> · <a href="https://github.com/qanzhi111/x402-mcp-adapter">MCP Adapter</a>
</p>
