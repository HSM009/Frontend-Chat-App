import { loginRequest } from "@/src/api/auth";

import { useAuthStore } from "@/src/store/authStore";

export async function loginUser(email: string, password: string) {
  const data = await loginRequest({
    email,
    password,
  });

  await useAuthStore.getState().login(data.user, data.token);

  return data;
}
