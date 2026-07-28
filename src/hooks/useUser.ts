import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "@/src/services/userService";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
}
