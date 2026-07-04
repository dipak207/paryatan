import User from "@/models/User";
import { IVisited } from "@/models/User";

export async function getVisited(userId: string) {
  const user = await User.findById(userId).select("visited");
  return user?.visited || [];
}

export async function addVisited(userId: string, dto: Omit<IVisited, "visitedDate"> & { visitedDate?: string | Date }) {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };
  if (user.visited.some((visited: IVisited) => visited.xid === dto.xid)) {
    throw { status: 409, message: "Already marked visited" };
  }
  const visitedDate = dto.visitedDate ? new Date(dto.visitedDate) : new Date();
  user.visited.push({ ...dto, visitedDate } as IVisited);
  await user.save();
  return user.visited;
}

export async function removeVisited(userId: string, xid: string) {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };
  user.visited = user.visited.filter((visited: IVisited) => visited.xid !== xid);
  await user.save();
  return user.visited;
}
