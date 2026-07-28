import { registerRequest } from "@/src/api/auth";

export async function registerUser(
  name: string,
  phone: string,
  password: string,
) {
  return registerRequest({
    name,
    phone,
    password,
  });
}
