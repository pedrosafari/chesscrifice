import axios from "axios";

const API_URL = "http://localhost:8080/api";

export async function getChessPlayer(username) {
  const response = await axios.get(`${API_URL}/external/chess-player/${username}`);
  return response.data;
}