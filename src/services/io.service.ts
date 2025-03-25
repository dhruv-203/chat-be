import { ApiError } from "../../utils/ApiError";
import { getUserById } from "./auth.service";

export async function getConnectedUsers(ConnectedUsers: {
  [key: string]: string;
}) {
  const connectedUsers = (
    await Promise.all(
      Object.keys(ConnectedUsers).map((key) => {
        return getUserById(key);
      })
    )
  ).map((user) => {
    if (user instanceof ApiError) {
      throw user;
    } else {
      return {
        id: user.id,
        name: user.name,
        profilePicture: user.profilePicture,
      };
    }
  });
  return connectedUsers;
}
