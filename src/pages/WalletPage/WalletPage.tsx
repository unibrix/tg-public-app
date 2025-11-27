import { Section, List, Cell, Avatar } from "@telegram-apps/telegram-ui";
import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "../../store";
import { useBiometricAuth } from "../../hooks/useBiometricAuth";
import { useHaptics } from "../../hooks/useHaptics";
import { formatPrice, formatTimeAgo } from "../../utils/format";
import { CoinListSkeleton } from "./WalletPageSkeleton";
import { CoinDetailModal, CoinData } from "./CoinDetailModal";
import styles from "./WalletPage.module.css";

const COINS = [
  { id: "bitcoin", name: "Bitcoin", symbol: "btc" },
  { id: "ethereum", name: "Ethereum", symbol: "eth" },
  { id: "solana", name: "Solana", symbol: "sol" },
  { id: "dogecoin", name: "Dogecoin", symbol: "doge" },
  { id: "cardano", name: "Cardano", symbol: "ada" },
  { id: "ripple", name: "XRP", symbol: "xrp" },
];

// SVG icons from cryptocurrency-icons via jsDelivr CDN
const COIN_IMAGES: Record<string, string> = {
  bitcoin: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/svg/color/btc.svg",
  ethereum: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/svg/color/eth.svg",
  solana: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/svg/color/sol.svg",
  dogecoin: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/svg/color/doge.svg",
  cardano: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/svg/color/ada.svg",
  ripple: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/svg/color/xrp.svg",
};

interface PriceData {
  [key: string]: {
    usd: number;
    usd_24h_change?: number;
  };
}

export function WalletPage() {
  const [prices, setPrices] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);

  const { favoriteCoins, toggleFavorite } = useAppStore();
  const { withBiometricAuth } = useBiometricAuth();
  const { impact } = useHaptics();


  const fetchPrices = useCallback(async () => {
    try {
      const ids = COINS.map((c) => c.id).join(",");
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPrices(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleStarClick = async (
    e: React.MouseEvent,
    coinId: string
  ) => {
    e.stopPropagation();
    impact("medium");

    const isFavorite = favoriteCoins.includes(coinId);
    const reason = isFavorite ? "Remove from favorites" : "Add to favorites";

    await withBiometricAuth(() => toggleFavorite(coinId), reason);
  };

  const handleCoinClick = (coin: typeof COINS[0]) => {
    if (!prices || !prices[coin.id]) return;
    impact("light");

    setSelectedCoin({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price: prices[coin.id].usd,
      change24h: prices[coin.id].usd_24h_change || 0,
      image: COIN_IMAGES[coin.id],
    });
  };

  const renderCoinRow = (coin: typeof COINS[0]) => {
    const priceData = prices?.[coin.id];
    const isFavorite = favoriteCoins.includes(coin.id);
    const change = priceData?.usd_24h_change || 0;

    return (
      <Cell
        key={coin.id}
        before={
          <Avatar
            size={48}
            src={COIN_IMAGES[coin.id]}
            acronym={coin.symbol.toUpperCase()}
          />
        }
        subtitle={coin.symbol.toUpperCase()}
        after={
          <div className={styles.priceContainer}>
            <div className={styles.priceInfo}>
              <div className={styles.priceValue}>
                {priceData ? formatPrice(priceData.usd) : "—"}
              </div>
              <div className={`${styles.priceChange} ${change >= 0 ? styles.priceUp : styles.priceDown}`}>
                {change >= 0 ? "+" : ""}
                {change.toFixed(2)}%
              </div>
            </div>
            <button
              className={`${styles.starButton} ${isFavorite ? styles.starFilled : ""}`}
              onClick={(e) => handleStarClick(e, coin.id)}
            >
              {isFavorite ? "★" : "☆"}
            </button>
          </div>
        }
        onClick={() => handleCoinClick(coin)}
      >
        {coin.name}
      </Cell>
    );
  };

  const favoritesList = COINS.filter((c) => favoriteCoins.includes(c.id));
  const othersList = COINS.filter((c) => !favoriteCoins.includes(c.id));

  return (
    <>
      <List>
        {loading ? (
          <Section header="Loading...">
            <CoinListSkeleton count={6} />
          </Section>
        ) : error ? (
          <Section header="Error">
            <Cell
              subtitle="Tap to retry"
              onClick={() => {
                setLoading(true);
                fetchPrices();
              }}
            >
              {error}
            </Cell>
          </Section>
        ) : (
          <>
            {favoritesList.length > 0 && (
              <Section header="Favorites">
                {favoritesList.map(renderCoinRow)}
              </Section>
            )}
            <Section header={favoritesList.length > 0 ? "All Assets" : "Assets"}>
              {othersList.map(renderCoinRow)}
            </Section>
          </>
        )}

        {lastUpdated && !loading && !error && (
          <div className={styles.footer}>
            Updated {formatTimeAgo(lastUpdated)}
          </div>
        )}

      </List>

      {selectedCoin && (
        <CoinDetailModal
          coin={selectedCoin}
          onClose={() => setSelectedCoin(null)}
        />
      )}
    </>
  );
}
