import styles from "./WeatherPage.module.css";

export function WeatherWidgetSkeleton() {
  return (
    <div className={styles.weatherWidgetContent}>
      <div className={`${styles.weatherSkeletonIcon} ${styles.skeleton}`}></div>
      <div>
        <div
          className={`${styles.weatherSkeletonTemp} ${styles.skeleton}`}
        ></div>
        <div
          className={`${styles.weatherSkeletonDesc} ${styles.skeleton}`}
        ></div>
        <div
          className={`${styles.weatherSkeletonCity} ${styles.skeleton}`}
        ></div>
      </div>
    </div>
  );
}

export function MapSkeleton() {
  return <div className={`${styles.mapSkeleton} ${styles.skeleton}`}></div>;
}
