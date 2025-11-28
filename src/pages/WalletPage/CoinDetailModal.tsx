import { useState, useCallback } from "react";
import { useAppStore } from "../../store";
import { useBiometricAuth } from "../../hooks/useBiometricAuth";
import { useHaptics } from "../../hooks/useHaptics";
import { formatPrice, formatHolding } from "../../utils/format";
import styles from "./WalletPage.module.css";

export interface CoinData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  image: string;
}

interface CoinDetailModalProps {
  coin: CoinData;
  onClose: () => void;
}

const ANIMATION_DURATION = 200;

export function CoinDetailModal({ coin, onClose }: CoinDetailModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const { favoriteCoins, holdings, toggleFavorite, addHolding } = useAppStore();
  const { withBiometricAuth } = useBiometricAuth();
  const { impact } = useHaptics();

  const isFavorite = favoriteCoins.includes(coin.id);
  const currentHolding = holdings[coin.id] || 0;
  const holdingValue = currentHolding * coin.price;

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(onClose, ANIMATION_DURATION);
  }, [isClosing, onClose]);

  const handleFavoriteToggle = async () => {
    impact("medium");
    const reason = isFavorite ? "Remove from favorites" : "Add to favorites";
    await withBiometricAuth(() => toggleFavorite(coin.id), reason);
  };

  const handleBuy = async () => {
    impact("medium");
    const result = await withBiometricAuth(() => {
      const buyAmount = 100 / coin.price;
      addHolding(coin.id, buyAmount);
    }, `Confirm purchase of ${coin.symbol.toUpperCase()}`);

    if (result.success) {
      handleClose();
    }
  };

  return (
    <div
      className={`${styles.modal} ${isClosing ? styles.modalClosing : ""}`}
      onClick={handleClose}
    >
      <div
        className={`${styles.modalContent} ${isClosing ? styles.modalContentClosing : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeButton} onClick={handleClose}>
          ×
        </button>

        <div className={styles.modalHeader}>
          <img
            src={coin.image}
            alt={coin.name}
            className={styles.modalCoinIcon}
          />
          <div>
            <div className={styles.modalCoinName}>{coin.name}</div>
            <div className={styles.modalCoinSymbol}>{coin.symbol}</div>
          </div>
        </div>

        <div className={styles.modalStats}>
          <div className={styles.modalStatRow}>
            <span className={styles.modalStatLabel}>Price</span>
            <span className={styles.modalStatValue}>
              {formatPrice(coin.price)}
            </span>
          </div>
          <div className={styles.modalStatRow}>
            <span className={styles.modalStatLabel}>24h Change</span>
            <span
              className={`${styles.modalStatValue} ${
                coin.change24h >= 0 ? styles.priceUp : styles.priceDown
              }`}
            >
              {coin.change24h >= 0 ? "+" : ""}
              {coin.change24h.toFixed(2)}%
            </span>
          </div>
          <div className={styles.modalStatRow}>
            <span className={styles.modalStatLabel}>Your Holdings</span>
            <span className={styles.modalStatValue}>
              {formatHolding(currentHolding)} {coin.symbol.toUpperCase()}
            </span>
          </div>
          {currentHolding > 0 && (
            <div className={styles.modalStatRow}>
              <span className={styles.modalStatLabel}>Holdings Value</span>
              <span className={styles.modalStatValue}>
                {formatPrice(holdingValue)}
              </span>
            </div>
          )}
        </div>

        <div className={styles.modalActions}>
          <button
            className={`${styles.modalButton} ${styles.favoriteButton}`}
            onClick={handleFavoriteToggle}
          >
            {isFavorite ? "★ Remove" : "☆ Favorite"}
          </button>
          <button
            className={`${styles.modalButton} ${styles.buyButton}`}
            onClick={handleBuy}
          >
            Buy $100
          </button>
        </div>
      </div>
    </div>
  );
}
