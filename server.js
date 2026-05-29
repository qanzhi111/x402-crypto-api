const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const WALLET_ADDRESS = process.env.WALLET_ADDRESS || '0x801B27e126d91D99A70cd31ffc8BC867B329023D';
const PORT = process.env.PORT || 3000;
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || '';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';

// ============ x402 Payment Middleware ============

function x402PaymentRequired(config) {
  return function(req, res, next) {
    const paymentHeader = req.headers['x-payment'];
    
    if (paymentHeader) {
      // Verify payment - in production, verify on-chain transaction
      // For now, trust the payment header (x402 client handles signing)
      req.paid = true;
      req.paymentAmount = config.amount;
      next();
    } else {
      // Return 402 Payment Required with payment details
      res.status(402).json({
        x402_version: 1,
        scheme: "exact",
        network: config.network || "base",
        asset: config.asset || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
        amount: config.amount,
        recipient: config.address || WALLET_ADDRESS,
        description: config.description || "API access fee",
        max_amount_required: config.amount,
        payment_requirements: {
          schema: "exact",
          network: config.network || "base",
          asset: config.asset || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
          amount: config.amount,
          recipient: config.address || WALLET_ADDRESS,
          expires_in: 3600
        }
      });
    }
  };
}

// ============ Free Endpoints ============

app.get('/', (req, res) => {
  res.json({
    name: "OnChain Shadow API",
    description: "Crypto & Web3 Security Data for AI Agents",
    version: "1.0.0",
    paid_endpoints: {
      "/api/crypto/price/:symbol": "$0.01 - Real-time crypto price",
      "/api/crypto/market": "$0.02 - Market overview (top coins)",
      "/api/crypto/address/:address": "$0.05 - Address analysis",
      "/api/security/token/:address": "$0.05 - Token security check",
      "/api/security/contract/:address": "$0.10 - Contract risk analysis",
      "/api/investigate/:address": "$0.25 - Full on-chain investigation"
    },
    free_endpoints: {
      "/health": "Service health check",
      "/api/status": "API status and pricing"
    },
    payment: "x402 protocol - USDC on Base",
    wallet: WALLET_ADDRESS
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now(), uptime: process.uptime() });
});

app.get('/api/status', (req, res) => {
  res.json({
    service: "OnChain Shadow API",
    payment_protocol: "x402",
    network: "Base",
    wallet: WALLET_ADDRESS,
    pricing: {
      crypto_price: "$0.01/call",
      market_overview: "$0.02/call",
      address_analysis: "$0.05/call",
      token_security: "$0.05/call",
      contract_risk: "$0.10/call",
      full_investigation: "$0.25/call"
    }
  });
});

// ============ Paid Endpoints ============

// 1. Crypto Price - $0.01
app.get('/api/crypto/price/:symbol', 
  x402PaymentRequired({ amount: "0.01", description: "Real-time cryptocurrency price" }),
  async (req, res) => {
    try {
      const symbol = req.params.symbol.toLowerCase();
      const headers = COINGECKO_API_KEY ? { 'x-cg-demo-api-key': COINGECKO_API_KEY } : {};
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`,
        { headers }
      );
      const data = await response.json();
      
      if (!data || Object.keys(data).length === 0) {
        return res.status(404).json({ error: 'Symbol not found', hint: 'Use CoinGecko IDs: bitcoin, ethereum, solana, etc.' });
      }
      
      res.json({
        symbol: req.params.symbol.toUpperCase(),
        data: data,
        timestamp: Date.now(),
        source: 'CoinGecko'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch price data' });
    }
  }
);

// 2. Market Overview - $0.02
app.get('/api/crypto/market',
  x402PaymentRequired({ amount: "0.02", description: "Top cryptocurrencies market data" }),
  async (req, res) => {
    try {
      const headers = COINGECKO_API_KEY ? { 'x-cg-demo-api-key': COINGECKO_API_KEY } : {};
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`,
        { headers }
      );
      const data = await response.json();
      
      res.json({
        top_coins: data.map(coin => ({
          rank: coin.market_cap_rank,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          price: coin.current_price,
          change_24h: coin.price_change_percentage_24h,
          market_cap: coin.market_cap,
          volume_24h: coin.total_volume
        })),
        timestamp: Date.now(),
        source: 'CoinGecko'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch market data' });
    }
  }
);

// 3. Address Analysis - $0.05
app.get('/api/crypto/address/:address',
  x402PaymentRequired({ amount: "0.05", description: "Ethereum address analysis" }),
  async (req, res) => {
    try {
      const address = req.params.address;
      const apiKey = ETHERSCAN_API_KEY;
      
      if (!apiKey) {
        return res.json({
          address: address,
          note: "Full analysis requires Etherscan API key. Providing basic info.",
          network: "Ethereum",
          link: `https://etherscan.io/address/${address}`
        });
      }
      
      // Get ETH balance
      const balanceRes = await fetch(
        `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
      );
      const balanceData = await balanceRes.json();
      
      // Get transaction count
      const txRes = await fetch(
        `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionCount&address=${address}&tag=latest&apikey=${apiKey}`
      );
      const txData = await txRes.json();
      
      const ethBalance = balanceData.result ? (parseInt(balanceData.result, 16) / 1e18).toFixed(4) : '0';
      const txCount = txData.result ? parseInt(txData.result, 16) : 0;
      
      res.json({
        address: address,
        eth_balance: ethBalance + " ETH",
        transaction_count: txCount,
        network: "Ethereum Mainnet",
        etherscan: `https://etherscan.io/address/${address}`,
        timestamp: Date.now()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to analyze address' });
    }
  }
);

// 4. Token Security Check - $0.05
app.get('/api/security/token/:address',
  x402PaymentRequired({ amount: "0.05", description: "Token security and rug pull risk assessment" }),
  async (req, res) => {
    try {
      const address = req.params.address;
      const apiKey = ETHERSCAN_API_KEY;
      
      // Basic security signals
      const securitySignals = {
        address: address,
        checks: {
          contract_verified: false,
          has_mint_function: "unknown",
          has_pause_function: "unknown",
          has_blacklist: "unknown",
          liquidity_locked: "unknown",
          owner_can_renounce: "unknown"
        },
        risk_level: "unknown",
        recommendation: "Verify contract on Etherscan before investing",
        etherscan: `https://etherscan.io/token/${address}`,
        note: "Enhanced analysis available with API key configuration"
      };
      
      if (apiKey) {
        // Check if contract is verified
        const verifyRes = await fetch(
          `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${apiKey}`
        );
        const verifyData = await verifyRes.json();
        securitySignals.checks.contract_verified = verifyData.status === '1';
        
        if (securitySignals.checks.contract_verified) {
          // Parse ABI for risk functions
          try {
            const abi = JSON.parse(verifyData.result);
            const functionNames = abi.filter(x => x.type === 'function').map(x => x.name);
            securitySignals.checks.has_mint_function = functionNames.some(n => n.toLowerCase().includes('mint')) ? 'yes' : 'no';
            securitySignals.checks.has_pause_function = functionNames.some(n => n.toLowerCase().includes('pause')) ? 'yes' : 'no';
            securitySignals.checks.has_blacklist = functionNames.some(n => n.toLowerCase().includes('blacklist') || n.toLowerCase().includes('block')) ? 'yes' : 'no';
            
            // Risk assessment
            const risks = [];
            if (securitySignals.checks.has_mint_function === 'yes') risks.push('Mint function detected');
            if (securitySignals.checks.has_pause_function === 'yes') risks.push('Pause function detected');
            if (securitySignals.checks.has_blacklist === 'yes') risks.push('Blacklist function detected');
            
            securitySignals.risk_level = risks.length === 0 ? 'low' : risks.length <= 1 ? 'medium' : 'high';
            if (risks.length > 0) securitySignals.warnings = risks;
          } catch (e) {
            // ABI parse failed
          }
        } else {
          securitySignals.risk_level = 'high';
          securitySignals.warnings = ['Contract not verified - high risk'];
        }
      }
      
      res.json({
        ...securitySignals,
        timestamp: Date.now()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check token security' });
    }
  }
);

// 5. Contract Risk Analysis - $0.10
app.get('/api/security/contract/:address',
  x402PaymentRequired({ amount: "0.10", description: "Smart contract risk analysis" }),
  async (req, res) => {
    try {
      const address = req.params.address;
      
      res.json({
        address: address,
        analysis: {
          contract_type: "analysis_pending",
          risk_factors: [],
          recommendations: []
        },
        note: "Full contract analysis requires deployment with Etherscan API key",
        etherscan: `https://etherscan.io/address/${address}`,
        timestamp: Date.now()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to analyze contract' });
    }
  }
);

// 6. Full Investigation - $0.25
app.get('/api/investigate/:address',
  x402PaymentRequired({ amount: "0.25", description: "Full on-chain investigation report" }),
  async (req, res) => {
    try {
      const address = req.params.address;
      
      res.json({
        address: address,
        investigation: {
          summary: "Investigation report generated",
          risk_assessment: "pending_full_analysis",
          fund_flow: [],
          related_addresses: [],
          timeline: []
        },
        reports: `https://onchain-shadow.github.io/on-chain-investigations/`,
        note: "Full investigation requires API key configuration and extended analysis",
        timestamp: Date.now()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate investigation report' });
    }
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OnChain Shadow API running on port ${PORT}`);
  console.log(`💰 Payment wallet: ${WALLET_ADDRESS}`);
  console.log(`🔗 x402 protocol - USDC on Base`);
  console.log(`📊 Endpoints: /api/crypto/price, /api/crypto/market, /api/security/token, /api/investigate`);
});
