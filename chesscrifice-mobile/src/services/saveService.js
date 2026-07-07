import axios from "axios";

const API_URL = "http://localhost:8080/api";

export async function listSaves() {
  const response = await axios.get(`${API_URL}/saves`);
  return response.data;
}

export async function createSave(saveData) {
  const response = await axios.post(`${API_URL}/saves`, saveData);
  return response.data;
}

export async function updateSave(id, saveData) {
  const response = await axios.put(`${API_URL}/saves/${id}`, saveData);
  return response.data;
}

export async function getSave(id) {
  const response = await axios.get(`${API_URL}/saves/${id}`);
  return response.data;
}

export async function deleteSave(id) {
  await axios.delete(`${API_URL}/saves/${id}`);
}