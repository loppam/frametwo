"use client"; 
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { createArt, uploadProductPhoto } from '../api/fetch/fetchDetails';

interface ArtResponse {
  data: {
    insertedId: string;
  };
}

const ArtForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [hoc, setHoc] = useState<string>('');
  const [usdt, setUsdt] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const artResponse: ArtResponse = await createArt({ name, hoc, usdt, insertedId: '' });
      const artId = artResponse.data.insertedId;

      if (!file) throw new Error('No file selected');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('artId', artId);

      await uploadProductPhoto(formData);

      alert('Art and image uploaded successfully!');
      // Reset form fields
      setName('');
      setHoc('');
      setUsdt('');
      setFile(null);
    } catch (error: any) {
      console.error('Error uploading art and image:', error);
      alert(error.response?.data?.message || 'Failed to upload art and image.');
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileType = selectedFile.type;
      if (!fileType.startsWith('image/')) {
        alert('Please select a valid image file.');
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
        <input
          type="file"
          name='file'
          onChange={handleFileChange}
          required
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default ArtForm;
