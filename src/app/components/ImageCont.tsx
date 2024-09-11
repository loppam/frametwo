"use client";
import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import ArtForm from "./ArtForm";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./Firebase";

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
  const [isArtFormOpen, setIsArtFormOpen] = useState(false); // State to manage ArtForm modal

  const handleClose = () => {
    setOpen(false);
    setIsArtFormOpen(false); // Close both modals if needed
  };
  const handleOpen = (art: Art) => {
    setOpen(true);
    setSelectedArt(art);
  };
  const handleArtFormOpen = () => {
    setIsArtFormOpen(true); // Open the ArtForm modal
  };
  const handleDelete = async (artId: string) => {
    try {
      // Delete the document from Firebase Firestore
      await deleteDoc(doc(db, "art", artId));

      // Update the state to remove the deleted art from the list
      setArts((prevArts) => prevArts.filter((art) => art.id !== artId));
      setOpen(false); // Close the modal after deletion
    } catch (err: any) {
      console.error("Error deleting art:", err);
      setError(err);
    }
  };
  // Function to fetch artworks from Firestore
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

  useEffect(() => {
    fetchArts();
  }, []);

  // Function to update the art list when a new art is added
  const updateArtList = (newArt: Art) => {
    setArts((prevArts) => [newArt, ...prevArts]);
  };

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
              <img
                src={art.imageUrl}
                alt={art.name}
                width={300}
                height={300}
                className="max-w-full max-h-full object-contain"
              />
            </button>
          </li>
        ))}
      </ul>

      {/* Art detail modal */}
      {selectedArt && (
        <Modal isOpen={open} onClose={handleClose}>
          <div className="modal">
            <div className="content">
              <img
                src={selectedArt.imageUrl}
                alt={selectedArt.name}
                width={300}
                height={300}
                className="max-w-full max-h-full object-contain"
              />
              <div className="text">
                <h2>{selectedArt.name}</h2>
                <p> Art time: {selectedArt.hoc} hour(s)</p>
                <p>Value: {selectedArt.usdt} USDT</p>

                <button className="delete" onClick={() => handleDelete(selectedArt.id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ArtForm modal */}
      <Modal isOpen={isArtFormOpen} onClose={handleClose}>
        <ArtForm updateArtList={updateArtList} /> {/* Pass the callback */}
      </Modal>

      {/* Float button to open ArtForm modal */}
      <button className="float" onClick={handleArtFormOpen}>
        +
      </button>
    </div>
  );
};

export default ImageCont;
