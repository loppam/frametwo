import { getFrameMetadata } from "frog/next";
import type { Metadata } from "next";
import LoginValidator from "./components/LoginValidator";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const frameTags = await getFrameMetadata("https://frametwo.vercel.app/api");

  return {
    // Return metadata based on frameTags
    other: frameTags,
  };
}

export default function Home(): JSX.Element {
  return (
    <div className={styles.app}>
      <LoginValidator />
    </div>
  );
}
