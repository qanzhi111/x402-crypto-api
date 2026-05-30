import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const X402_API_BASE = "https://spectacular-strength-production-0494.up.railway.app";
const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

// Create MCP server
const server = new McpServer({
  name: "x402-crypto-api",
  version: "1.0.0",
  description: "Cryptocurrency price API with x402 payment protocol. Get real-time BTC, ETH prices, market data, and trending coins. Payments handled automatically via x402 protocol on Base chain."
});

// Tool 1: Get Bitcoin Price
server.tool(
  "btc_price",
  "Get current Bitcoin (BTC) price",
  { currency: z.string().optional().describe("Target currency (default: USD)") },
  async ({ currency = "USD" }) => {
    try {
      const res = await fetch(`${X402_API_BASE}/api/crypto/btc/price?currency=${currency}`);
      const data = await res.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Tool 2: Get Ethereum Price
server.tool(
  "eth_price",
  "Get current Ethereum (ETH) price",
  { currency: z.string().optional().describe("Target currency (default: USD)") },
  async ({ currency = "USD" }) => {
    try {
      const res = await fetch(`${X402_API_BASE}/api/crypto/eth/price?currency=${currency}`);
      const data = await res.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Tool 3: Market Data
server.tool(
  "market_data",
  "Get cryptocurrency market data including top coins by market cap",
  { limit: z.number().optional().describe("Number of coins (default: 10)") },
  async ({ limit = 10 }) => {
    try {
      const res = await fetch(`${X402_API_BASE}/api/crypto/market?limit=${limit}`);
      const data = await res.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Tool 4: Trending Coins
server.tool(
  "trending_coins",
  "Get trending cryptocurrency coins based on social media activity",
  { limit: z.number().optional().describe("Number of coins (default: 10)") },
  async ({ limit = 10 }) => {
    try {
      const res = await fetch(`${X402_API_BASE}/api/crypto/trending?limit=${limit}`);
      const data = await res.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Tool 5: Any Coin Price
server.tool(
  "coin_price",
  "Get price for any supported cryptocurrency by symbol",
  {
    symbol: z.string().describe("Coin symbol (e.g., BTC, ETH, SOL, DOGE)"),
    currency: z.string().optional().describe("Target currency (default: USD)")
  },
  async ({ symbol, currency = "USD" }) => {
    try {
      const res = await fetch(`${X402_API_BASE}/api/crypto/${symbol.toLowerCase()}/price?currency=${currency}`);
      const data = await res.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Tool 6: API Status
server.tool(
  "api_status",
  "Check the x402 API service status and payment requirements",
  {},
  async () => {
    try {
      const res = await fetch(`${X402_API_BASE}/health`);
      const data = await res.json();
      const payRes = await fetch(`${X402_API_BASE}/402`);
      const payData = await payRes.json();
      return { content: [{ type: "text", text: JSON.stringify({ health: data, payment: payData }, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Setup MCP transport
const transport = new StreamableHTTPServerTransport("/");
await server.connect(transport);

// Mount MCP handler
app.use("/", transport.handleRequest || server);

// Health endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "x402-crypto-api-mcp", version: "1.0.0" });
});

app.listen(PORT, () => {
  console.log(`x402 MCP Adapter running on port ${PORT}`);
  console.log(`Backend API: ${X402_API_BASE}`);
});
