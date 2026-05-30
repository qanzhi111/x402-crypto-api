# x402 Crypto API - MCP Server

![MCP Server](https://img.shields.io/badge/MCP-Server-blue?style=flat-square)
![x402 Protocol](https://img.shields.io/badge/x402-Protocol-7C3AED?style=flat-square)
![USDC Payments](https://img.shields.io/badge/USDC-Base-0052FF?style=flat-square)
![Price: $0.01/req](https://img.shields.io/badge/Price-$0.01/request-10B981?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-18+-black?style=flat-square)

An **MCP (Model Context Protocol) server** providing crypto market data, Web3 security analysis, and on-chain investigation tools for AI agents. Built on the [x402 payment protocol](https://x402.org) — AI agents pay per request using USDC on Base, with no API keys required.

## 🤖 MCP Server Configuration

Add to your MCP client (Claude Desktop, Cursor, etc.):

```json
{
  "mcpServers": {
    "x402-crypto-api": {
      "type": "sse",
      "url": "https://spectacular-strength-production-0494.up.railway.app/mcp"
    }
  }
}
```

### MCP Tools

| Tool | Price | Description |
|------|-------|-------------|
| `get_crypto_price` | $0.01 | Get real-time cryptocurrency price by symbol |
| `get_market_overview` | $0.02 | Get top 20 crypto market data (price, market cap, volume) |
| `analyze_address` | $0.05 | Analyze an Ethereum address (balance, transactions, risk) |
| `check_token_security` | $0.05 | Check token for rug pull/honeypot indicators |
| `analyze_contract` | $0.10 | Smart contract risk analysis and vulnerability scan |
| `investigate_address` | $0.25 | Full on-chain investigation report for an address |

### MCP Resources

- `crypto://prices` — Real-time crypto price feed
- `crypto://market` — Market overview data
- `security://token/{address}` — Token security data
- `security://contract/{address}` — Contract analysis

### MCP Prompts

- `investigate_wallet` — Guide a full on-chain investigation of a wallet address
- `token_safety_check` — Prompt template for checking token security
- `market_analysis` — Analyze current crypto market conditions

## 🔌 Direct API Access

The MCP server also exposes a REST API for direct HTTP access:

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

## 💰 Payment (x402 Protocol)

All paid tools and endpoints use the **x402 protocol** with **USDC on Base**. No API keys needed — the MCP client handles payment automatically.

| Detail | Value |
|--------|-------|
| Payment wallet | `0x801B27e126d91D99A70cd31ffc8BC867B329023D` |
| Network | Base (Chain ID: 8453) |
| Asset | USDC |

### How x402 Works

1. Client sends request to paid tool/endpoint
2. Server responds with `HTTP 402` + payment details
3. Client signs USDC payment via x402
4. Client resends request with `X-Payment` header
5. Server verifies payment and returns data

## 🚀 Quick Start

### Use as MCP Server

Add the server config above to your MCP client, then:

```
User: What's the current price of Bitcoin?
AI Agent: [calls get_crypto_price tool] → Bitcoin is currently at $XX,XXX
```

### Use via cURL

```bash
# Check API status (free)
curl https://spectacular-strength-production-0494.up.railway.app/health

# Get BTC price (requires x402 payment)
curl https://spectacular-strength-production-0494.up.railway.app/api/crypto/price/BTC
```

### Use via Python

```python
import requests

# Free endpoint
health = requests.get("https://spectacular-strength-production-0494.up.railway.app/health")
print(health.json())

# Paid endpoint (with x402 payment headers)
headers = {"X-Payment": "your-x402-payment-header"}
response = requests.get(
    "https://spectacular-strength-production-0494.up.railway.app/api/crypto/price/BTC",
    headers=headers
)
print(response.json())
```

## 📦 MCP Adapter

For environments that need a standalone MCP adapter, see [x402-mcp-adapter](https://github.com/qanzhi111/x402-mcp-adapter) — a dedicated MCP server wrapper that connects to this API.

## 🛠 Deployment

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

## 📊 Revenue Potential

At $0.01-$0.25 per call:

| Daily Calls | Daily Revenue | Monthly Revenue |
|-------------|---------------|------------------|
| 100 | $5-25 | $150-750 |
| 1,000 | $50-250 | $1,500-7,500 |
| 10,000 | $500-2,500 | $15,000-75,000 |

## 🔗 Available On

- [Smithery](https://smithery.ai/server/kaitongkouzi/x402-crypto-api) — MCP server marketplace
- [Glama](https://glama.ai/mcp/servers/qanzhi111/x402-crypto-api) — MCP server directory
- [Agent402](https://agent402.ai) — x402 payment gateway
- [x402Scout](https://x402scout.com) — Crypto analytics

## 📄 Data Sources

| Source | Data Type | Free Tier |
|--------|-----------|-----------|
| **CoinGecko** | Crypto prices & market data | 30 calls/min |
| **Etherscan** | On-chain data | 100K calls/day |

---

<p align="center">
  <strong>MCP Server powered by x402</strong><br>
  <a href="https://x402.org">x402 Protocol</a> · <a href="https://modelcontextprotocol.io">MCP Specification</a> · <a href="https://github.com/qanzhi111/x402-mcp-adapter">MCP Adapter</a>
</p>
