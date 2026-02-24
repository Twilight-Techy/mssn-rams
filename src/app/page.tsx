import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import LoginButton from "@/components/LoginButton";
import styles from './page.module.css';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className={styles.pageContainer}>
      <div className={`glass-card ${styles.loginCard}`}>
        <div className={styles.logoContainer}>
          {/* We will rely on the user to put logo.png in public dir */}
          <img
            src="/logo.png"
            alt="MSSN LASU Epe Logo"
            className={styles.logo}
          />
        </div>

        <h1 className={styles.title}>MSSN RAMS</h1>
        <p className={styles.subtitle}>
          Ramadan Attendance Management System
        </p>

        <LoginButton />

        <p className={styles.footerText}>
          &copy; {new Date().getFullYear()} Muslim Students' Society of Nigeria <br /> LASU Epe Branch
        </p>
      </div>
    </div>
  );
}
