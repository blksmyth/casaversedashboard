const state = {
    tokens: [
        '0x6982508145454ce325ddbe47a25d4ec3d2311933', // PEPE
        '0xb90b2a35c65dbc466b04240097ca756ad2005295', // BOBO
        '8NNXWrWVctNw1UFeaBypffimTdcLCcD8XJzHvYsmgwpF', // Token 3 (Solana)
        '0x3ec2156d4c0a9cbdab4a016633b7bcf6a8d68ea2', // Token 4
        '0x420698cfdeddea6bc78d59bc17798113ad278f9d', // Token 5
        '0x58d6e314755c2668f3d7358cc7a7a06c4314b238', // Token 6
        '4G3kNxwaA2UQHDpaQtJWQm1SReXcUD7LkT14v2oEs7rV', // Token 7 (Solana)
        '0x22af33fe49fd1fa80c7149773dde5890d3c76f3b', // Token 8
        '0x2b5050f01d64fbb3e4ac44dc07f0732bfb5ecadf', // Token 9
        '0x3313338fe4bb2a166b81483bfcb2d4a6a1ebba8d', // Token 10
        '0x3D01Fe5A38ddBD307fDd635b4Cb0e29681226D6f', // Token 11
        '0xff836a5821e69066c87e268bc51b849fab94240c', // Token 12
        '0xaee9ba9ce49fe810417a36408e34d9962b653e78', // Token 13
        '0x2f573070e6090b3264fe707e2c9f201716f123c7', // Token 14
        'J9zjM2nn4DBYpFy3qrReaUzY66g4EFMwLa61YSGCpump', // Token 15 (Solana)
        'AbNzAEiA7zbNngcUFL92b7vEAUtJscSPwAiWV38Apump', // Token 16 (Solana)
        '0x3f34d75da1027d20d052970c83bd4ddf8991557d', // Token 17
        'CPKPoYC8eEXhsRRVQJPsvgwB6nUB4a987YkciNpMmsJP', // Token 18 (Solana)
        '0x20ad9d807644fc6d89f680851253a1ddc174dc1c', // Token 19
        '0x594daad7d77592a2b97b725a7ad59d7e188b5bfa'  // Token 20
    ]
};

// Function to add a token by address (called by User input via console or code update)
async function addToken(address) {
    if (state.tokens.includes(address)) return;
    state.tokens.push(address);
    await updateDashboard();
}

// Function to fetch data from DexScreener
async function fetchTokenData(address) {
    try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
        const data = await response.json();
        if (data.pairs && data.pairs.length > 0) {
            // Get the most liquid pair or the first one
            // DexScreener usually sorts by liquidity, but let's take the one with the highest liquidity just in case
            // actually first one is usually best match for 'tokens' endpoint
            return data.pairs[0];
        }
        return null;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

function formatCurrency(num) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}

function formatCompact(num) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: "compact", maximumFractionDigits: 2 }).format(num);
}

function renderCard(pair) {
    if (!pair) return '';

    const priceChange = pair.priceChange.h24;
    const isUp = priceChange >= 0;
    const changeClass = isUp ? 'up' : 'down';
    const changeSymbol = isUp ? '▲' : '▼';

    // Safely get Market Cap (mcap) or FDV if mcap is missing (common in some dex pairs)
    const mcap = pair.marketCap || pair.fdv || 0;

    return `
        <div class="card">
            <div class="token-header">
                <span class="token-name">${pair.baseToken.name}</span>
                <span class="token-symbol">${pair.baseToken.symbol}</span>
            </div>
            
            <div class="market-cap-section">
                <div class="market-cap-label">Market Cap</div>
                <div class="market-cap-value">${formatCurrency(mcap)}</div>
            </div>

            <div class="price-row">
                <div class="price">Price: $${pair.priceUsd}</div>
                <div class="change ${changeClass}">
                    ${changeSymbol} ${Math.abs(priceChange).toFixed(2)}% (24h)
                </div>
            </div>
        </div>
    `;
}

async function updateDashboard() {
    const grid = document.getElementById('dashboard-grid');

    if (state.tokens.length === 0) {
        grid.innerHTML = `
            <div class="card empty-state">
                <div class="loader"></div>
                <p>Waiting for contract addresses...</p>
            </div>
        `;
        return;
    }

    const cardsHTML = [];

    for (const address of state.tokens) {
        const data = await fetchTokenData(address);
        if (data) {
            cardsHTML.push(renderCard(data));
        }
    }

    grid.innerHTML = cardsHTML.join('');
}

// Initial Render
updateDashboard();

// Poll every 30 seconds
setInterval(updateDashboard, 30000);
