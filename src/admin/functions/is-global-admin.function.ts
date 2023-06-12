import { roles } from "src/config";
import { UserFromClient } from "src/user/interfaces/user-from-client.interface";
import { User } from "src/user/interfaces/user.interface";

export default function isGlobalAdmin(user: User | UserFromClient) {
  return user.roles.includes(roles.global_admin)
}
