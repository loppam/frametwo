import { getFrameMetadata } from 'frog/next';
import type { Metadata } from 'next';
import ImageCont from './components/ImageCont';
import ArtForm from './components/ArtForm';
import Image from 'next/image';

import styles from './page.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const frameTags = await getFrameMetadata(
    'https://frametwo.vercel.app/api'
  );

  return {
    // Return metadata based on frameTags
    other: frameTags,
  };
}

export default function Home(): JSX.Element {
  return (
    <div className={styles.App}>
      <ImageCont />
      <ArtForm />
    </div>
  );
}
