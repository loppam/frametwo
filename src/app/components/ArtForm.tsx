"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./Firebase"; // Ensure this path is correct

type ArtFormProps = {
  updateArtList: (newArt: any) => void; // Callback to update art list in the parent component
};

const ArtForm: React.FC<ArtFormProps> = ({ updateArtList }) => {
  const [name, setName] = useState<string>("");
  const [hoc, setHoc] = useState<string>("");
  const [usdt, setUsdt] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); // Start loading
    setError(null); // Reset error

    try {
      if (!file) throw new Error("No file selected");

      // Upload image to Firebase Storage
      const storageRef = ref(storage, `art/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);

      // Add document to Firestore
      const newArt = {
        name,
        hoc: Number(hoc),
        usdt: Number(usdt),
        imageUrl,
        createdAt: new Date(),
      };
      const docRef = await addDoc(collection(db, "art"), newArt);

      setStatus("Art and image uploaded successfully!");

      // Update the parent state with the new art
      updateArtList({ id: docRef.id, ...newArt });

      // Reset form fields on success
      setName("");
      setHoc("");
      setUsdt("");
      setFile(null);
    } catch (error: any) {
      console.error("Error uploading art and image:", error);
      setError(error.message || "Failed to upload art and image.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileType = selectedFile.type;
      if (!fileType.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
      }
      setFile(selectedFile);
    }
  };

  return (
    <div className="loginformm">
      <form className="" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Creation Hour(s)"
          value={hoc}
          onChange={(e) => setHoc(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Value(USDT)"
          value={usdt}
          onChange={(e) => setUsdt(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/png, image/gif, image/jpeg, image/jpg, image/webp"
          name="file"
          onChange={handleFileChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
        {status}
        {/* Display error if any */}
        {error && <p className="error">{error}</p>}
      </form>

      {/* Show a loading spinner or any indicator */}
      {loading && <p>Uploading art, please wait...</p>}
    </div>
  );
};

export default ArtForm;
