import { roles } from "src/config";
import { User } from "src/user/interfaces/user.interface";

export default function isGlobalAdmin(user: User) {
  return user.roles.includes(roles.global_admin)
}