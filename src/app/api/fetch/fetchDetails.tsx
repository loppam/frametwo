import axios, { AxiosResponse } from "axios";
import axiosClient from "../axiosClient";

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
