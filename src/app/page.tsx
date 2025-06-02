import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}></main>
      <h1> Karnaugh Map</h1>
      <footer className={styles.footer}></footer>
    </div>
  );
}
