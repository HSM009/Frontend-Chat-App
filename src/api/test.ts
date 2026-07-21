import { api } from "./client";

export async function testBackend() {
  try {
    const response = await api.get("/");

    console.log("Backend Response:", response.data);
  } catch (error) {
    console.log("Backend Error:", error);
  }
}
