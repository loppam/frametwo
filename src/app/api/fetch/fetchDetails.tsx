import axiosClient from "../axiosClient";
import { AxiosResponse } from "axios";

// Define the types for the frame art object and API response
interface ArtData {
  imageUrl: string;
  title: string;
}

export async function fetchArtData(fid: number): Promise<ArtData> {
  try {
    console.log("Fetching art data for fid:", fid);
    const response = await axiosClient.get("/art");
    console.log("API response:", response.data);

    const artworks = response.data;

    if (!Array.isArray(artworks) || artworks.length === 0) {
      throw new Error("No artworks found");
    }

    // Select a random artwork from the array
    const randomArtwork = artworks[Math.floor(Math.random() * artworks.length)];

    return {
      imageUrl: randomArtwork.image[0].url,
      title: randomArtwork.name,
    };
  } catch (error) {
    console.error("Error fetching art data:", error);
    throw new Error("Failed to fetch art data");
  }
}

// Define the types for the art object and API response
interface Art {
  insertedId: any;
  _id?: string;
  name: string;
  hoc: string;
  usdt: string;
  image?: { url: string }[];
}

export const fetchArts = (): Promise<AxiosResponse<Art[]>> => {
  return axiosClient.get("/art/");
};

export const deleteArt = (id: string): Promise<AxiosResponse<void>> => {
  return axiosClient.delete(`/art/${id}`);
};

export const updateArt = (
  id: string,
  data: Partial<Art>
): Promise<AxiosResponse<Art>> => {
  return axiosClient.patch(`/art/${id}`, data); // Use PATCH for updates
};

const API_URL = "https://ololade-sule.wl.r.appspot.com";

export const createArt = async (
  artDetails: Art
): Promise<AxiosResponse<Art>> => {
  const response = await axiosClient.post(`/art`, artDetails); // Use axiosClient instead of axios
  return response;
};

export const uploadProductPhoto = async (
  formData: FormData
): Promise<AxiosResponse<{ url: string }>> => {
  const response = await axiosClient.post(`/art/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
};
