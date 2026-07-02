import User from "../models/User";

interface VisitedDTO {
  xid: string;
  destinationName: string;
  image?: string;
  country?: string;
  visitedDate?: string | Date;
}

export async function getVisited(userId: string) {
  const user = await User.findById(userId).select("visited");
  return user?.visited || [];
}

export async function addVisited(userId: string, dto: VisitedDTO) {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };
  const exists = user.visited.find((v) => v.xid === dto.xid);
  if (exists) throw { status: 409, message: "Already marked visited" };
  const visitedDate = dto.visitedDate ? new Date(dto.visitedDate) : new Date();
  user.visited.push({ ...(dto as any), visitedDate });
  await user.save();
  return user.visited;
}

export async function removeVisited(userId: string, xid: string) {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };
  user.visited = user.visited.filter((v) => v.xid !== xid);
  await user.save();
  return user.visited;
}
