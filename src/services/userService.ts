import { getUsers } from "../api/user";

export async function fetchUsers() {
  return await getUsers();
}
