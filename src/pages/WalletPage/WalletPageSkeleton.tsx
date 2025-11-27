import styles from "./WalletPage.module.css";

export function CoinRowSkeleton() {
  return (
    <div className={styles.coinRow}>
      <div className={`${styles.skeletonIcon} ${styles.skeleton}`} />
      <div className={styles.coinInfo}>
        <div className={`${styles.skeletonName} ${styles.skeleton}`} />
        <div className={`${styles.skeletonSymbol} ${styles.skeleton}`} />
      </div>
      <div className={styles.coinPrice}>
        <div className={`${styles.skeletonPrice} ${styles.skeleton}`} />
        <div className={`${styles.skeletonChange} ${styles.skeleton}`} />
      </div>
      <div className={`${styles.skeletonStar} ${styles.skeleton}`} />
    </div>
  );
}

export function CoinListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <CoinRowSkeleton key={i} />
      ))}
    </>
  );
}
