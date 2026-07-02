import User from "../models/User";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";

interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

export async function register(dto: RegisterDTO) {
  const existing = await User.findOne({ email: dto.email });
  if (existing) throw { status: 409, message: "Email already registered" };
  const hashed = await hashPassword(dto.password);
  const user = await User.create({ name: dto.name, email: dto.email, password: hashed, provider: "local" });
  const token = generateToken({ id: user._id });
  const safeUser = { id: user._id, name: user.name, email: user.email, provider: user.provider };
  return { user: safeUser, token };
}

export async function login(dto: LoginDTO) {
  const user = await User.findOne({ email: dto.email });
  if (!user) throw { status: 401, message: "Invalid credentials" };
  if (!user.password) throw { status: 401, message: "No local password set" };
  const ok = await comparePassword(dto.password, user.password);
  if (!ok) throw { status: 401, message: "Invalid credentials" };
  const token = generateToken({ id: user._id });
  const safeUser = { id: user._id, name: user.name, email: user.email, provider: user.provider };
  return { user: safeUser, token };
}

export async function googleLogin(idToken: string) {
  // Verify token with Google
  const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
  const resp = await (await import("axios")).default.get(url).catch((e) => null);
  if (!resp || !resp.data || !resp.data.email) throw { status: 401, message: "Invalid Google token" };
  const { email, name, sub: googleId } = resp.data;
  let user = await User.findOne({ email });
  if (user) {
    // attach google id if missing
    if (!user.googleId) {
      user.googleId = googleId;
      user.provider = "google";
      await user.save();
    }
  } else {
    user = await User.create({ name: name || email.split("@")[0], email, provider: "google", googleId });
  }
  const token = generateToken({ id: user._id });
  const safeUser = { id: user._id, name: user.name, email: user.email, provider: user.provider };
  return { user: safeUser, token };
}

export async function facebookLogin(accessToken: string) {
  // Verify with Facebook Graph API
  const axios = (await import("axios")).default;
  const url = `https://graph.facebook.com/me`;
  const resp = await axios
    .get(url, { params: { fields: "id,name,email", access_token: accessToken } })
    .catch((e) => null);
  if (!resp || !resp.data || !resp.data.id) throw { status: 401, message: "Invalid Facebook token" };
  const { id: facebookId, email, name } = resp.data;
  if (!email) throw { status: 400, message: "Facebook account did not provide email" };
  let user = await User.findOne({ email });
  if (user) {
    if (!user.facebookId) {
      user.facebookId = facebookId;
      user.provider = "facebook";
      await user.save();
    }
  } else {
    user = await User.create({ name: name || email.split("@")[0], email, provider: "facebook", facebookId });
  }
  const token = generateToken({ id: user._id });
  const safeUser = { id: user._id, name: user.name, email: user.email, provider: user.provider };
  return { user: safeUser, token };
}

export async function googleCallback(code: string) {
  const axios = (await import("axios")).default;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirect = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/google/callback`;
  const tokenResp = await axios.post(
    "https://oauth2.googleapis.com/token",
    new URLSearchParams({ code, client_id: clientId || "", client_secret: clientSecret || "", redirect_uri: redirect, grant_type: "authorization_code" }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  const idToken = tokenResp.data.id_token;
  return googleLogin(idToken);
}

export async function facebookCallback(code: string) {
  const axios = (await import("axios")).default;
  const clientId = process.env.FACEBOOK_APP_ID;
  const clientSecret = process.env.FACEBOOK_APP_SECRET;
  const redirect = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/facebook/callback`;
  const tokenResp = await axios.get("https://graph.facebook.com/v17.0/oauth/access_token", {
    params: { client_id: clientId, redirect_uri: redirect, client_secret: clientSecret, code },
  });
  const accessToken = tokenResp.data.access_token;
  return facebookLogin(accessToken);
}
