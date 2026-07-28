import { loginRequest } from "@/src/api/auth";

import { useAuthStore } from "@/src/store/authStore";

export async function loginUser(phone: string, password: string) {
  const data = await loginRequest({
    phone,
    password,
  });

  await useAuthStore.getState().login(data.user, data.accessToken);

  return data;
}
