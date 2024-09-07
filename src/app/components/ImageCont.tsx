"use client";
import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./Firebase";
import Image from 'next/image';

type Art = {
  id: string;
  name: string;
  hoc: number;
  usdt: number;
  imageUrl: string;
};

const ImageCont = () => {
  const [arts, setArts] = useState<Art[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedArt, setSelectedArt] = useState<Art | null>(null);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = (art: Art) => {
    setOpen(true);
    setSelectedArt(art);
  };

  useEffect(() => {
    const fetchArts = async () => {
      try {
        const artCollection = collection(db, "art");
        const artSnapshot = await getDocs(artCollection);
        const artList = artSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Art[];
        setArts(artList);
        setLoading(false);
      } catch (err: any) {
        setError(err);
        setLoading(false);
      }
    };

    fetchArts();

  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Art List</h1>
      <ul>
        {arts.map((art) => (
          <li key={art.id}>
            <button onClick={() => handleOpen(art)}>
              <img src={art.imageUrl} alt={art.name} width={300} height={300} className="max-w-full max-h-full object-contain" />
            </button>
          </li>
        ))}
      </ul>
      {selectedArt && (
        <Modal isOpen={open} onClose={handleClose}>
          <div className="modal">
            <img src={selectedArt.imageUrl} alt={selectedArt.name} width={300} height={300} className="max-w-full max-h-full object-contain" />
            <div className="text">
              <h2>{selectedArt.name}</h2>
              <p>HOC: {selectedArt.hoc}</p>
              <p>USDT: {selectedArt.usdt}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ImageCont;
