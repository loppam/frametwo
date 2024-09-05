import axios, { AxiosResponse } from "axios";
import axiosClient from "../axiosClient";
//Define the types for the frame art object and API response

interface ArtData {
  imageUrl: string;
  title: string;
}

export async function fetchArtData(fid: number): Promise<ArtData> {
  try {
    // Replace this URL with your actual API endpoint
    const response = await axios.get("https://ololade-sule.wl.r.appspot.com/uploads");

    const data = response.data;

    // Adjust these fields based on your API's response structure
    return {
      imageUrl: data.image_url,
      title: data.title,
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
  return axiosClient.post(`/art/${id}`, data);
};

const API_URL = "https://ololade-sule.wl.r.appspot.com";

export const createArt = async (
  artDetails: Art
): Promise<AxiosResponse<Art>> => {
  const response = await axios.post(`${API_URL}/art`, artDetails);
  return response;
};

export const uploadProductPhoto = async (
  formData: FormData
): Promise<AxiosResponse<{ url: string }>> => {
  const response = await axios.post(`${API_URL}/art/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
};
