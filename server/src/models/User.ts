import mongoose, { Schema, Document } from "mongoose";

export interface IFavorite {
  xid: string;
  destinationName: string;
  image?: string;
  country?: string;
}

export interface IVisited extends IFavorite {
  visitedDate: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  provider: string;
  googleId?: string;
  facebookId?: string;
  favorites: IFavorite[];
  visited: IVisited[];
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>({
  xid: { type: String, required: true },
  destinationName: { type: String, required: true },
  image: { type: String },
  country: { type: String },
});

const VisitedSchema = new Schema<IVisited>({
  xid: { type: String, required: true },
  destinationName: { type: String, required: true },
  image: { type: String },
  country: { type: String },
  visitedDate: { type: Date, default: Date.now },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    provider: { type: String, default: "local" },
    googleId: { type: String },
    facebookId: { type: String },
    favorites: { type: [FavoriteSchema], default: [] },
    visited: { type: [VisitedSchema], default: [] },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
