"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./Firebase"; // Ensure this path is correct

interface ArtResponse {
  data: {
    insertedId: string;
  };
}

const ArtForm: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [hoc, setHoc] = useState<string>("");
  const [usdt, setUsdt] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!file) throw new Error("No file selected");

      // Upload image to Firebase Storage
      const storageRef = ref(storage, `art/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);

      // Add document to Firestore
      const docRef = await addDoc(collection(db, "art"), {
        name,
        hoc: Number(hoc),
        usdt: Number(usdt),
        imageUrl,
        createdAt: new Date(),
      });

      alert("Art and image uploaded successfully!");
      // Reset form fields
      setName("");
      setHoc("");
      setUsdt("");
      setFile(null);
    } catch (error: any) {
      console.error("Error uploading art and image:", error);
      alert(error.message || "Failed to upload art and image.");
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
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>HOC:</label>
        <input
          type="number"
          value={hoc}
          onChange={(e) => setHoc(e.target.value)}
          required
        />
      </div>
      <div>
        <label>USDT:</label>
        <input
          type="number"
          value={usdt}
          onChange={(e) => setUsdt(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Image:</label>
        <input type="file" name="file" onChange={handleFileChange} required />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default ArtForm;
