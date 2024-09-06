"use client";
import React, { useState, useEffect } from "react";
import { collection, getDocs, DocumentData } from 'firebase/firestore';
import { db } from './Firebase'

interface Art {
  id: string;
  name: string;
  imageUrl: string;
}

const ImageCont: React.FC = () => {
  const [arts, setArts] = useState<Art[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [frames, setFrames] = useState<Art[]>(Array(9).fill(null));

  useEffect(() => {
    const fetchArts = async () => {
      try {
        const artCollection = collection(db, 'art');
        const artSnapshot = await getDocs(artCollection);
        const artList = artSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          imageUrl: doc.data().imageUrl
        }));
        setArts(artList);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        setLoading(false);
      }
    };

    fetchArts();
  }, []);

  const handleFrameClick = (index: number) => {
    if (arts.length === 0) return;
    
    const randomArt = arts[Math.floor(Math.random() * arts.length)];
    const newFrames = [...frames];
    newFrames[index] = randomArt;
    setFrames(newFrames);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {frames.map((frame, index) => (
        <div 
          key={index} 
          className="border-2 border-gray-300 aspect-square flex items-center justify-center cursor-pointer"
          onClick={() => handleFrameClick(index)}
        >
          {frame ? (
            <div className="text-center">
              <img src={frame.imageUrl} alt={frame.name} className="max-w-full max-h-full object-contain" />
              <p className="mt-2">{frame.name}</p>
            </div>
          ) : (
            <p>Click to reveal art</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageCont;
