/**
 * CROO CAP Provider - OnChain Shadow API
 * 
 * Wraps x402-crypto-api as a CROO Agent, enabling A2A commerce.
 * Other agents can discover, hire, and pay this agent via the CROO marketplace.
 * 
 * Tracks: DeFi / On-chain Ops + Developer Tooling
 */

const WebSocket = require('ws');
const fetch = require('node-fetch');

// Configuration
const CROO_API_URL = process.env.CROO_API_URL || 'https://api.croo.network';
const CROO_WS_URL = process.env.CROO_WS_URL || 'wss://api.croo.network/ws';
const CROO_SDK_KEY = process.env.CROO_SDK_KEY;

// Internal x402 API base URL (local or deployed)
const X402_API_BASE = process.env.X402_API_BASE || 'http://localhost:3000';

// Service definitions matching x402 endpoints
const SERVICES = {
  'crypto-price': {
    name: 'Crypto Price Lookup',
    description: 'Get real-time cryptocurrency price data with 24h change and market cap',
    price: 0.01,
    endpoint: '/api/crypto/price/{symbol}',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'CoinGecko ID (e.g. bitcoin, ethereum, solana)' }
      },
      required: ['symbol']
    },
    outputFormat: 'json'
  },
  'market-overview': {
    name: 'Market Overview',
    description: 'Top 20 cryptocurrencies with price, 24h change, market cap and volume',
    price: 0.02,
    endpoint: '/api/crypto/market',
    inputSchema: { type: 'object', properties: {} },
    outputFormat: 'json'
  },
  'address-analysis': {
    name: 'Address Analysis',
    description: 'Analyze an Ethereum address: balance, transaction count, and risk signals',
    price: 0.05,
    endpoint: '/api/crypto/address/{address}',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Ethereum address (0x...)' }
      },
      required: ['address']
    },
    outputFormat: 'json'
  },
  'token-security': {
    name: 'Token Security Check',
    description: 'Check token contract for rug pull risk: mint, pause, blacklist functions',
    price: 0.05,
    endpoint: '/api/security/token/{address}',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Token contract address (0x...)' }
      },
      required: ['address']
    },
    outputFormat: 'json'
  },
  'contract-risk': {
    name: 'Contract Risk Analysis',
    description: 'Deep smart contract risk analysis with vulnerability assessment',
    price: 0.10,
    endpoint: '/api/security/contract/{address}',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Contract address (0x...)' }
      },
      required: ['address']
    },
    outputFormat: 'json'
  },
  'onchain-investigation': {
    name: 'Full On-chain Investigation',
    description: 'Complete on-chain investigation: fund flow, related addresses, risk assessment, timeline',
    price: 0.25,
    endpoint: '/api/investigate/{address}',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Address to investigate (0x...)' }
      },
      required: ['address']
    },
    outputFormat: 'json'
  }
};

class CrooProvider {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 5000;
    this.isRunning = false;
  }

  async start() {
    if (!CROO_SDK_KEY) {
      console.error('❌ CROO_SDK_KEY is required. Set it as environment variable.');
      process.exit(1);
    }

    console.log('🚀 Starting OnChain Shadow CROO Provider...');
    console.log(`📡 Connecting to CROO: ${CROO_WS_URL}`);
    console.log(`🔗 Internal API: ${X402_API_BASE}`);
    console.log(`📋 Services: ${Object.keys(SERVICES).join(', ')}`);

    this.connectWebSocket();
    this.isRunning = true;

    // Graceful shutdown
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  connectWebSocket() {
    try {
      this.ws = new WebSocket(CROO_WS_URL, {
        headers: {
          'Authorization': `Bearer ${CROO_SDK_KEY}`,
        }
      });

      this.ws.on('open', () => {
        console.log('✅ Connected to CROO network');
        this.reconnectAttempts = 0;
      });

      this.ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(message);
        } catch (err) {
          console.error('Error processing message:', err.message);
        }
      });

      this.ws.on('close', () => {
        console.log('🔌 Disconnected from CROO');
        this.attemptReconnect();
      });

      this.ws.on('error', (err) => {
        console.error('WebSocket error:', err.message);
      });
    } catch (err) {
      console.error('Connection failed:', err.message);
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnect attempts reached. Exiting.');
      process.exit(1);
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
    console.log(`🔄 Reconnecting in ${Math.round(delay / 1000)}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => this.connectWebSocket(), delay);
  }

  async handleMessage(message) {
    const { type, data: msgData } = message;

    switch (type) {
      case 'negotiation_request':
        await this.handleNegotiation(msgData);
        break;
      case 'order_created':
        await this.handleOrderCreated(msgData);
        break;
      case 'order_paid':
        await this.handleOrderPaid(msgData);
        break;
      default:
        console.log(`📌 Unhandled message type: ${type}`);
    }
  }

  async handleNegotiation(data) {
    const { order_id, service_id, terms } = data;
    console.log(`📨 Negotiation request: order=${order_id}, service=${service_id}`);

    // Accept all negotiations for our services
    const response = {
      type: 'accept_negotiation',
      data: {
        order_id,
        accepted: true,
        terms_accepted: true
      }
    };

    this.send(response);
    console.log(`✅ Accepted negotiation for order ${order_id}`);
  }

  async handleOrderCreated(data) {
    const { order_id } = data;
    console.log(`📦 Order created: ${order_id}`);
  }

  async handleOrderPaid(data) {
    const { order_id, service_id, input } = data;
    console.log(`💰 Order paid: ${order_id}, service: ${service_id}`);

    try {
      // Find the matching service
      const service = SERVICES[service_id];
      if (!service) {
        throw new Error(`Unknown service: ${service_id}`);
      }

      // Call the internal x402 API (bypass payment since we're the provider)
      const result = await this.callInternalAPI(service, input);

      // Deliver the result
      const delivery = {
        type: 'deliver_order',
        data: {
          order_id,
          result: result,
          proof: {
            timestamp: Date.now(),
            service_id,
            input_hash: this.hashInput(input),
            output_hash: this.hashInput(result),
          }
        }
      };

      this.send(delivery);
      console.log(`📤 Delivered result for order ${order_id}`);

    } catch (err) {
      console.error(`❌ Failed to process order ${order_id}:`, err.message);
      
      // Report failure
      this.send({
        type: 'delivery_failed',
        data: {
          order_id,
          error: err.message
        }
      });
    }
  }

  async callInternalAPI(service, input) {
    let url = `${X402_API_BASE}${service.endpoint}`;
    const options = {
      headers: {
        'x-internal-call': 'true',  // Signal internal call to bypass x402 payment
        'Content-Type': 'application/json'
      }
    };

    // Replace path parameters
    if (input) {
      for (const [key, value] of Object.entries(input)) {
        url = url.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    console.log(`🔍 Calling internal API: ${url}`);
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  hashInput(data) {
    // Simple hash for delivery proof
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('❌ WebSocket not connected, cannot send message');
    }
  }

  shutdown() {
    console.log('🛑 Shutting down provider...');
    this.isRunning = false;
    if (this.ws) {
      this.ws.close();
    }
    process.exit(0);
  }
}

// Start the provider
const provider = new CrooProvider();
provider.start();
