import User from "@/models/User";
import { hashPassword, comparePassword } from "@/utils/hash";
import { generateToken } from "@/lib/auth";

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
  if (existing) {
    throw { status: 409, message: "Email already registered" };
  }

  const hashed = await hashPassword(dto.password);
  const user = await User.create({
    name: dto.name,
    email: dto.email,
    password: hashed,
    provider: "local",
  });

  const token = generateToken({ id: user._id.toString() });
  const safeUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    provider: user.provider,
  };
  return { user: safeUser, token };
}

export async function login(dto: LoginDTO) {
  const user = await User.findOne({ email: dto.email });
  if (!user || !user.password) {
    throw { status: 401, message: "Invalid credentials" };
  }

  const ok = await comparePassword(dto.password, user.password);
  if (!ok) {
    throw { status: 401, message: "Invalid credentials" };
  }

  const token = generateToken({ id: user._id.toString() });
  const safeUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    provider: user.provider,
  };
  return { user: safeUser, token };
}

export async function googleLogin(idToken: string) {
  const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
  const resp = await fetch(url).then((res) => res.json()).catch(() => null);
  if (!resp || !resp.email) {
    throw { status: 401, message: "Invalid Google token" };
  }

  const { email, name, sub: googleId } = resp as { email: string; name?: string; sub?: string };
  let user = await User.findOne({ email });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      user.provider = "google";
      await user.save();
    }
  } else {
    user = await User.create({
      name: name || email.split("@")[0],
      email,
      provider: "google",
      googleId,
    });
  }

  const token = generateToken({ id: user._id.toString() });
  const safeUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    provider: user.provider,
  };

  return { user: safeUser, token };
}

export async function facebookLogin(accessToken: string) {
  const url = "https://graph.facebook.com/me";
  const resp = await fetch(`${url}?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`)
    .then((res) => res.json())
    .catch(() => null);

  if (!resp || !resp.id) {
    throw { status: 401, message: "Invalid Facebook token" };
  }

  const { id: facebookId, email, name } = resp as { id: string; email?: string; name?: string };
  if (!email) {
    throw { status: 400, message: "Facebook account did not provide email" };
  }

  let user = await User.findOne({ email });
  if (user) {
    if (!user.facebookId) {
      user.facebookId = facebookId;
      user.provider = "facebook";
      await user.save();
    }
  } else {
    user = await User.create({
      name: name || email.split("@")[0],
      email,
      provider: "facebook",
      facebookId,
    });
  }

  const token = generateToken({ id: user._id.toString() });
  const safeUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    provider: user.provider,
  };
  return { user: safeUser, token };
}

export async function googleCallback(code: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    throw { status: 500, message: "Google OAuth not configured" };
  }

  const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  }).then((res) => res.json());

  const idToken = (tokenResp as { id_token?: string }).id_token;
  if (!idToken) {
    throw { status: 400, message: "Invalid Google callback response" };
  }

  return googleLogin(idToken);
}

export async function facebookCallback(code: string) {
  const clientId = process.env.FACEBOOK_APP_ID;
  const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/facebook/callback`;

  if (!clientId || !clientSecret) {
    throw { status: 500, message: "Facebook OAuth not configured" };
  }

  const tokenResp = await fetch(
    `https://graph.facebook.com/v17.0/oauth/access_token?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&client_secret=${encodeURIComponent(clientSecret)}&code=${encodeURIComponent(code)}`
  ).then((res) => res.json());

  const accessToken = (tokenResp as { access_token?: string }).access_token;
  if (!accessToken) {
    throw { status: 400, message: "Invalid Facebook callback response" };
  }

  return facebookLogin(accessToken);
}
