import { useState, useEffect } from "react";

function genAddr(prefix = "bc1q") {
  const c = "abcdefghijklmnopqrstuvwxyz0123456789";
  return prefix + Array.from({ length: 38 }, () => c[Math.floor(Math.random() * c.length)]).join("");
}
function genTx() {
  const c = "abcdef0123456789";
  return Array.from({ length: 64 }, () => c[Math.floor(Math.random() * c.length)]).join("");
}
function fmt(n, d = 2) { return Number(n).toLocaleString("ru-RU", { minimumFractionDigits: d, maximumFractionDigits: d }); }
function fmtBTC(n) { return Number(n).toFixed(8); }
function now() { return new Date().toISOString().slice(0, 16).replace("T", " "); }

const STOCKS_INIT = [
  { id: "AAPL", name: "Apple Inc.", sector: "Tech", price: 213.49, change: +1.24, color: "#a3e635", logo: "🍎" },
  { id: "TSLA", name: "Tesla Inc.", sector: "Auto", price: 178.32, change: -2.11, color: "#ef4444", logo: "⚡" },
  { id: "NVDA", name: "NVIDIA Corp.", sector: "Tech", price: 924.78, change: +3.87, color: "#22d3ee", logo: "🟢" },
  { id: "GOOGL", name: "Alphabet Inc.", sector: "Tech", price: 175.60, change: +0.55, color: "#facc15", logo: "🔵" },
  { id: "AMZN", name: "Amazon.com", sector: "E-Comm", price: 198.12, change: +1.02, color: "#f97316", logo: "📦" },
  { id: "MSFT", name: "Microsoft", sector: "Tech", price: 415.33, change: -0.34, color: "#60a5fa", logo: "🪟" },
  { id: "META", name: "Meta Platforms", sector: "Social", price: 534.21, change: +2.33, color: "#818cf8", logo: "👓" },
  { id: "BRK", name: "Berkshire Hath.", sector: "Finance", price: 627.40, change: +0.12, color: "#a78bfa", logo: "🏦" },
];

function fluctuate(stocks) {
  return stocks.map(s => {
    const delta = (Math.random() - 0.48) * s.price * 0.008;
    const newPrice = Math.max(1, s.price + delta);
    const change = ((newPrice - s.price) / s.price) * 100 + s.change;
    return { ...s, price: newPrice, change: Math.max(-15, Math.min(15, change)) };
  });
}

function genSparkline(base, count = 20) {
  const pts = [];
  let v = base;
  for (let i = 0; i < count; i++) {
    v += (Math.random() - 0.49) * base * 0.02;
    pts.push(Math.max(base * 0.8, v));
  }
  return pts;
}

const INIT = {
  usdBalance: 5000.00,
  btcBalance: 0.00412500,
  nvcBalance: 10000,
  btcAddress: genAddr("bc1q"),
  nvcAddress: genAddr("nvc1"),
  portfolio: {},
  transactions: [
    { id: genTx(), type: "receive", asset: "BTC", amount: 0.004125, date: "2026-05-14 10:32", status: "confirmed", note: "Пополнение" },
    { id: genTx(), type: "receive", asset: "NVC", amount: 10000, date: "2026-05-15 08:00", status: "confirmed", note: "Genesis" },
    { id: genTx(), type: "receive", asset: "USD", amount: 5000, date: "2026-05-15 09:00", status: "confirmed", note: "Стартовый баланс" },
  ],
};

function Sparkline({ data, color, width = 80, height = 32 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QRCode({ value, size = 120 }) {
  const seed = value.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const cells = 21;
  const grid = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c2) => {
      if ((r < 7 && c2 < 7) || (r < 7 && c2 >= cells - 7) || (r >= cells - 7 && c2 < 7)) return true;
      const n = (seed * (r * cells + c2 + 1) * 2654435761) >>> 0;
      return (n % 3) === 0;
    })
  );
  return (
    <div style={{ background: "#fff", padding: 8, borderRadius: 8, display: "inline-block" }}>
      <svg width={size} height={size} viewBox={`0 0 ${cells} ${cells}`}>
        {grid.map((row, r) => row.map((on, c2) => on ? <rect key={`${r}-${c2}`} x={c2} y={r} width={1} height={1} fill="#000" /> : null))}
      </svg>
    </div>
  );
}

function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: "#0f1923", color: "#4ade80", padding: "10px 20px", borderRadius: 24, fontSize: 13, fontWeight: 700, border: "1px solid #4ade8040", zIndex: 9999, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", boxShadow: "0 8px 32px #0008", animation: "slideUp .25s ease" }}>✓ {msg}</div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000b", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0b1622", width: "100%", maxWidth: 440, borderRadius: "22px 22px 0 0", padding: "24px 20px 36px", border: "1px solid #1e2d3d", borderBottom: "none", animation: "slideUp .3s ease", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{title}</span>
          <button onClick={onClose} style={{ background: "#1e2d3d", border: "none", color: "#94a3b8", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const lbl = { display: "block", color: "#64748b", fontSize: 12, marginBottom: 6, fontWeight: 600, letterSpacing: ".04em" };
const inp = { width: "100%", background: "#060e18", border: "1px solid #1e2d3d", borderRadius: 10, padding: "12px 14px", color: "#e2e8f0", fontSize: 14, outline: "none", fontFamily: "'Space Mono',monospace", boxSizing: "border-box" };
const infoRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 };
const infoLabel = { color: "#64748b", fontSize: 13 };
const infoVal = { color: "#94a3b8", fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700 };

function TradeModal({ stock, portfolio, usdBalance, onClose, onTrade }) {
  const [mode, setMode] = useState("buy");
  const [shares, setShares] = useState("1");
  const held = portfolio[stock.id]?.shares || 0;
  const total = parseFloat(shares) * stock.price;
  const canBuy = total <= usdBalance && parseFloat(shares) > 0;
  const canSell = parseFloat(shares) <= held && parseFloat(shares) > 0;
  function handle() {
    const n = parseFloat(shares);
    if (!n || n <= 0) return;
    if (mode === "buy" && !canBuy) return;
    if (mode === "sell" && !canSell) return;
    onTrade(mode, stock, n); onClose();
  }
  return (
    <Modal title={`${stock.logo} ${stock.id} — ${stock.name}`} onClose={onClose}>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {["buy", "sell"].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", background: mode === m ? (m === "buy" ? "#4ade80" : "#ef4444") : "#1e2d3d", color: mode === m ? "#000" : "#64748b", fontWeight: 700, fontSize: 14, fontFamily: "'Space Mono',monospace", transition: "all .2s" }}>{m === "buy" ? "Купить" : "Продать"}</button>
        ))}
      </div>
      <div style={infoRow}><span style={infoLabel}>Цена акции</span><span style={infoVal}>${fmt(stock.price)}</span></div>
      <div style={infoRow}><span style={infoLabel}>Баланс USD</span><span style={infoVal}>${fmt(usdBalance)}</span></div>
      {held > 0 && <div style={infoRow}><span style={infoLabel}>В портфеле</span><span style={infoVal}>{held} акц.</span></div>}
      <label style={lbl}>Количество акций</label>
      <input style={inp} type="number" min="0.01" step="0.01" value={shares} onChange={e => setShares(e.target.value)} />
      <div style={{ ...infoRow, marginTop: 10, borderTop: "1px solid #1e2d3d", paddingTop: 10 }}>
        <span style={infoLabel}>Итого</span>
        <span style={{ ...infoVal, fontSize: 18, color: "#f1f5f9" }}>${fmt(isNaN(total) ? 0 : total)}</span>
      </div>
      {mode === "buy" && !canBuy && parseFloat(shares) > 0 && <div style={{ color: "#f87171", fontSize: 12, marginTop: 6 }}>Недостаточно USD</div>}
      {mode === "sell" && !canSell && parseFloat(shares) > 0 && <div style={{ color: "#f87171", fontSize: 12, marginTop: 6 }}>Недостаточно акций</div>}
      <button onClick={handle} style={{ marginTop: 16, width: "100%", background: mode === "buy" ? "linear-gradient(135deg,#4ade80,#16a34a)" : "linear-gradient(135deg,#ef4444,#b91c1c)", border: "none", borderRadius: 12, padding: "14px", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'Space Mono',monospace" }}>{mode === "buy" ? "🛒 Купить" : "💸 Продать"}</button>
    </Modal>
  );
}

function ReceiveModal({ label, address, onClose }) {
  const [copied, setCopied] = useState(false);
  return (
    <Modal title={`Получить ${label}`} onClose={onClose}>
      <div style={{ textAlign: "center" }}>
        <QRCode value={address} size={140} />
        <div style={{ background: "#060e18", border: "1px solid #1e2d3d", borderRadius: 10, padding: "12px", marginTop: 14, wordBreak: "break-all", fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#94a3b8" }}>{address}</div>
        <button onClick={() => { navigator.clipboard?.writeText(address).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ marginTop: 14, width: "100%", background: copied ? "linear-gradient(135deg,#4ade80,#16a34a)" : "linear-gradient(135deg,#3b82f6,#2563eb)", border: "none", borderRadius: 12, padding: "13px", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
          {copied ? "✓ Скопировано!" : "📋 Копировать адрес"}
        </button>
      </div>
    </Modal>
  );
}

function SendModal({ label, symbol, balance, onClose, onSend }) {
  const [addr, setAddr] = useState(""); const [amt, setAmt] = useState(""); const [err, setErr] = useState("");
  function handle() {
    if (!addr.trim() || addr.length < 8) return setErr("Введите корректный адрес");
    const n = parseFloat(amt);
    if (!n || n <= 0) return setErr("Введите сумму");
    if (n > balance) return setErr("Недостаточно средств");
    onSend(addr, n); onClose();
  }
  return (
    <Modal title={`Отправить ${label}`} onClose={onClose}>
      <label style={lbl}>Адрес получателя</label>
      <input style={inp} placeholder="Адрес..." value={addr} onChange={e => setAddr(e.target.value)} />
      <label style={{ ...lbl, marginTop: 12 }}>Сумма ({symbol})</label>
      <div style={{ position: "relative" }}>
        <input style={inp} type="number" placeholder="0.00" value={amt} onChange={e => setAmt(e.target.value)} />
        <button onClick={() => setAmt(String(balance))} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "#1e3a5f", color: "#60a5fa", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>MAX</button>
      </div>
      <div style={{ color: "#475569", fontSize: 12, marginTop: 4 }}>Доступно: {balance} {symbol}</div>
      {err && <div style={{ color: "#f87171", fontSize: 13, marginTop: 8 }}>{err}</div>}
      <button onClick={handle} style={{ marginTop: 16, width: "100%", background: "linear-gradient(135deg,#f7931a,#ea580c)", border: "none", borderRadius: 12, padding: "14px", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>➤ Отправить</button>
    </Modal>
  );
}

function StockRow({ stock, sparkline, portfolio, onTrade, compact }) {
  const held = portfolio[stock.id]?.shares || 0;
  const up = stock.change >= 0;
  return (
    <div onClick={onTrade} style={{ background: "#0a1520", border: "1px solid #1e2d3d", borderRadius: 14, padding: compact ? "10px 12px" : "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "all .2s" }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${stock.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{stock.logo}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{stock.id}</span>
          {held > 0 && <span style={{ background: "#3b82f620", color: "#3b82f6", fontSize: 10, borderRadius: 4, padding: "2px 6px", fontWeight: 700 }}>{held} акц.</span>}
        </div>
        {!compact && <div style={{ color: "#64748b", fontSize: 12 }}>{stock.name}</div>}
      </div>
      <Sparkline data={sparkline} color={up ? "#4ade80" : "#ef4444"} width={60} height={28} />
      <div style={{ textAlign: "right", minWidth: 80 }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 13 }}>${fmt(stock.price)}</div>
        <div style={{ color: up ? "#4ade80" : "#ef4444", fontSize: 12, fontWeight: 700 }}>{up ? "▲" : "▼"} {Math.abs(stock.change).toFixed(2)}%</div>
      </div>
    </div>
  );
}

export default function App() {
  const [state, setState] = useState(INIT);
  const [stocks, setStocks] = useState(STOCKS_INIT);
  const [sparklines] = useState(() => Object.fromEntries(STOCKS_INIT.map(s => [s.id, genSparkline(s.price)])));
  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [tradeStock, setTradeStock] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const iv = setInterval(() => setStocks(s => fluctuate(s)), 3000);
    return () => clearInterval(iv);
  }, []);

  function toast_(msg) { setToast(msg); }

  function handleTrade(mode, stock, shares) {
    const cost = shares * stock.price;
    setState(s => {
      const held = s.portfolio[stock.id] || { shares: 0, avgPrice: stock.price };
      let newPortfolio = { ...s.portfolio };
      let newUsd = s.usdBalance;
      if (mode === "buy") {
        const newShares = held.shares + shares;
        const newAvg = (held.shares * held.avgPrice + shares * stock.price) / newShares;
        newPortfolio[stock.id] = { shares: newShares, avgPrice: newAvg };
        newUsd -= cost;
      } else {
        const newShares = held.shares - shares;
        if (newShares <= 0.0001) delete newPortfolio[stock.id];
        else newPortfolio[stock.id] = { ...held, shares: newShares };
        newUsd += cost;
      }
      return { ...s, usdBalance: newUsd, portfolio: newPortfolio, transactions: [{ id: genTx(), type: mode, asset: stock.id, amount: shares, price: stock.price, total: cost, date: now(), status: "confirmed", note: `${mode === "buy" ? "Покупка" : "Продажа"} ${shares} акц. ${stock.id}` }, ...s.transactions] };
    });
    toast_(`${mode === "buy" ? "Куплено" : "Продано"} ${shares} акц. ${stock.id} за $${fmt(cost)}`);
  }

  function handleSendCrypto(asset, toAddr, amount) {
    const key = asset === "BTC" ? "btcBalance" : "nvcBalance";
    setState(s => ({ ...s, [key]: +(s[key] - amount).toFixed(asset === "BTC" ? 8 : 2), transactions: [{ id: genTx(), type: "send", asset, amount, date: now(), status: "pending", note: `→ ${toAddr.slice(0, 16)}...` }, ...s.transactions] }));
    toast_(`Отправлено ${amount} ${asset}`);
  }

  const portfolioValue = Object.entries(state.portfolio).reduce((sum, [id, pos]) => {
    const s = stocks.find(s => s.id === id);
    return sum + (s ? s.price * pos.shares : 0);
  }, 0);

  const totalBalance = state.usdBalance + portfolioValue + state.btcBalance * 93420 + state.nvcBalance * 0.042;
  const filteredStocks = stocks.filter(s => s.id.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:#060e18;font-family:'Syne',sans-serif;color:#e2e8f0;-webkit-font-smoothing:antialiased;}
        @keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}
        input:focus{border-color:#3b82f6!important;}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0a1520}::-webkit-scrollbar-thumb{background:#1e2d3d;border-radius:4px}
      `}</style>
      <div style={{ minHeight: "100vh", background: "#060e18", maxWidth: 440, margin: "0 auto", paddingBottom: 80 }}>
        <div style={{ background: "linear-gradient(180deg,#0a1520,#060e18)", padding: "44px 20px 16px", borderBottom: "1px solid #1e2d3d" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 17, fontWeight: 700 }}>NOVA<span style={{ color: "#f7931a" }}>WALLET</span></div>
              <div style={{ color: "#475569", fontSize: 11, letterSpacing: ".08em" }}>CRYPTO · STOCKS · NVC</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#64748b", fontSize: 11, marginBottom: 2 }}>Общий баланс</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>${fmt(totalBalance)}</div>
            </div>
          </div>
        </div>

        {tab === "home" && (
          <div style={{ padding: "16px 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { label: "USD Баланс", val: `$${fmt(state.usdBalance)}`, color: "#4ade80", bg: "#4ade8012", icon: "💵" },
                { label: "Портфель акций", val: `$${fmt(portfolioValue)}`, color: "#60a5fa", bg: "#60a5fa12", icon: "📈" },
                { label: "Bitcoin", val: `${fmtBTC(state.btcBalance)} BTC`, color: "#f7931a", bg: "#f7931a12", icon: "₿" },
                { label: "NovaCoin", val: `${fmt(state.nvcBalance, 0)} NVC`, color: "#f5a623", bg: "#f5a62312", icon: "◈" },
              ].map(c => (
                <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.color}33`, borderRadius: 14, padding: "14px" }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icon}</div>
                  <div style={{ color: "#64748b", fontSize: 11, marginBottom: 4 }}>{c.label}</div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, color: c.color }}>{c.val}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700, letterSpacing: ".06em", marginBottom: 10 }}>БЫСТРЫЕ ДЕЙСТВИЯ</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {[
                  { label: "Акции", icon: "📊", action: () => setTab("stocks") },
                  { label: "BTC →", icon: "₿", action: () => setModal({ type: "send", asset: "BTC" }) },
                  { label: "BTC ←", icon: "⬇", action: () => setModal({ type: "receive", asset: "BTC" }) },
                  { label: "NVC →", icon: "◈", action: () => setModal({ type: "send", asset: "NVC" }) },
                ].map(a => (
                  <button key={a.label} onClick={a.action} style={{ background: "#0a1520", border: "1px solid #1e2d3d", borderRadius: 12, padding: "12px 4px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 20 }}>{a.icon}</span>
                    <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600 }}>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700, letterSpacing: ".06em" }}>🔴 LIVE РЫНОК</div>
                <button onClick={() => setTab("stocks")} style={{ background: "none", border: "none", color: "#3b82f6", fontSize: 13, cursor: "pointer" }}>Все акции</button>
              </div>
              {stocks.slice(0, 4).map(s => (
                <StockRow key={s.id} stock={s} sparkline={sparklines[s.id]} portfolio={state.portfolio} onTrade={() => setTradeStock(s)} compact />
              ))}
            </div>
          </div>
        )}

        {tab === "stocks" && (
          <div style={{ padding: "16px 20px" }}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 14 }}>📊 Рынок акций</div>
            <input style={{ ...inp, marginBottom: 14 }} placeholder="🔍 Поиск компании или тикера..." value={search} onChange={e => setSearch(e.target.value)} />
            {filteredStocks.map(s => (
              <StockRow key={s.id} stock={s} sparkline={sparklines[s.id]} portfolio={state.portfolio} onTrade={() => setTradeStock(s)} />
            ))}
          </div>
        )}

        {tab === "portfolio" && (
          <div style={{ padding: "16px 20px" }}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>💼 Мой портфель</div>
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>Стоимость: <span style={{ color: "#4ade80", fontWeight: 700 }}>${fmt(portfolioValue)}</span></div>
            {Object.keys(state.portfolio).length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#475569" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Портфель пуст</div>
                <div style={{ fontSize: 13 }}>Купите акции на вкладке «Рынок»</div>
                <button onClick={() => setTab("stocks")} style={{ marginTop: 16, background: "#3b82f6", border: "none", borderRadius: 12, padding: "12px 24px", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Перейти к рынку</button>
              </div>
            ) : Object.entries(state.portfolio).map(([id, pos]) => {
              const s = stocks.find(s => s.id === id);
              if (!s) return null;
              const value = s.price * pos.shares;
              const pnl = (s.price - pos.avgPrice) * pos.shares;
              const pnlPct = ((s.price - pos.avgPrice) / pos.avgPrice) * 100;
              return (
                <div key={id} onClick={() => setTradeStock(s)} style={{ background: "#0a1520", border: "1px solid #1e2d3d", borderRadius: 14, padding: "14px", marginBottom: 10, cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{s.logo}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{s.id}</div>
                        <div style={{ color: "#64748b", fontSize: 12 }}>{pos.shares} акц. · avg ${fmt(pos.avgPrice)}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 15 }}>${fmt(value)}</div>
                      <div style={{ color: pnl >= 0 ? "#4ade80" : "#ef4444", fontSize: 12, fontWeight: 700 }}>{pnl >= 0 ? "+" : ""}{fmt(pnl)} ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%)</div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 20 }}>
              <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700, letterSpacing: ".06em", marginBottom: 10 }}>КРИПТО АКТИВЫ</div>
              {[
                { label: "Bitcoin", sym: "BTC", bal: state.btcBalance, usd: state.btcBalance * 93420, color: "#f7931a", icon: "₿" },
                { label: "NovaCoin", sym: "NVC", bal: state.nvcBalance, usd: state.nvcBalance * 0.042, color: "#f5a623", icon: "◈" },
              ].map(a => (
                <div key={a.sym} style={{ background: "#0a1520", border: "1px solid #1e2d3d", borderRadius: 14, padding: "14px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${a.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: a.color }}>{a.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{a.label}</div>
                      <div style={{ color: "#64748b", fontSize: 12, fontFamily: "'Space Mono',monospace" }}>{a.sym === "BTC" ? fmtBTC(a.bal) : fmt(a.bal, 0)} {a.sym}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, color: a.color }}>${fmt(a.usd)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "history" && (
          <div style={{ padding: "16px 20px" }}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 14 }}>📋 История</div>
            {state.transactions.map(tx => (
              <div key={tx.id} style={{ background: "#0a1520", border: "1px solid #1e2d3d", borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: tx.type === "buy" ? "#4ade8020" : tx.type === "sell" ? "#ef444420" : tx.type === "send" ? "#f7931a20" : "#3b82f620", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                  {tx.type === "buy" ? "🛒" : tx.type === "sell" ? "💸" : tx.type === "send" ? "➤" : "⬇"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{tx.note}</div>
                  <div style={{ color: "#475569", fontSize: 11 }}>{tx.date}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {tx.total != null
                    ? <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, color: tx.type === "buy" ? "#ef4444" : "#4ade80" }}>{tx.type === "buy" ? "-" : "+"} ${fmt(tx.total)}</div>
                    : <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#94a3b8" }}>{tx.amount} {tx.asset}</div>
                  }
                  <div style={{ fontSize: 10, color: tx.status === "confirmed" ? "#4ade80" : "#f59e0b", fontWeight: 600 }}>{tx.status === "confirmed" ? "✓ подтверждено" : "⏳ ожидание"}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 440, background: "#0a1520", borderTop: "1px solid #1e2d3d", display: "flex", padding: "8px 0 20px", zIndex: 100 }}>
        {[
          { id: "home", icon: "🏠", label: "Главная" },
          { id: "stocks", icon: "📊", label: "Рынок" },
          { id: "portfolio", icon: "💼", label: "Портфель" },
          { id: "history", icon: "📋", label: "История" },
        ].map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: tab === item.id ? "#f7931a" : "#475569", padding: "6px 0" }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".04em" }}>{item.label}</span>
          </button>
        ))}
      </div>

      {modal?.type === "send" && <SendModal label={modal.asset} symbol={modal.asset} balance={modal.asset === "BTC" ? state.btcBalance : state.nvcBalance} onClose={() => setModal(null)} onSend={(addr, amt) => handleSendCrypto(modal.asset, addr, amt)} />}
      {modal?.type === "receive" && <ReceiveModal label={modal.asset} address={modal.asset === "BTC" ? state.btcAddress : state.nvcAddress} onClose={() => setModal(null)} />}
      {tradeStock && <TradeModal stock={tradeStock} portfolio={state.portfolio} usdBalance={state.usdBalance} onClose={() => setTradeStock(null)} onTrade={handleTrade} />}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </>
  );
}
