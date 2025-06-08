'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import styles from './Navigation.module.css';

export default function Navigation() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoContainer}>
          <Image
            src="/logo.svg"
            alt="Boolean Simplify Logo"
            width={32}
            height={32}
            priority
          />
          <span className={styles.siteName}>Boolean Simplify</span>
        </Link>
        
        <div className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <a 
            href="https://github.com/abrarshakhi/boolean-simplify" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.githubLink}
          >
            <Image
              src={theme === 'light' ? '/github-light.svg' : '/github-dark.svg'}
              alt="GitHub Repository"
              width={24}
              height={24}
            />
          </a>
          <button 
            onClick={toggleTheme} 
            className={styles.themeToggle}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </nav>
  );
} 