"use client";
import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { fetchArts } from "../api/fetch/fetchDetails";

const ImageCont = () => {
  const [arts, setArts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedArt, setSelectedArt] = useState(null);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = (art) => {
    setOpen(true);
    setSelectedArt(art);
  };

  useEffect(() => {
    fetchArts()
      .then((response) => {
        setArts(response.data);
        console.log(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
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
          <li key={art._id}>
            <button onClick={() => handleOpen(art)}>
              {/* {art._id} */}
              {art.image[0] && (
                <img accept="image/*" src={art.image[0].url} alt="" />
              )}
            </button>
          </li>
        ))}
      </ul>
      {selectedArt && (
        <Modal isOpen={open} onClose={handleClose}>
          <div className="modal">
            <img accept="image/*" src={selectedArt.image[0].url} alt="" />
            <div className="text">
              <h2>{selectedArt.name}</h2>
              <p>{selectedArt.hoc}</p>
              <p>{selectedArt.usdt}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ImageCont;
