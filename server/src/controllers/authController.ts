import { Request, Response } from "express";
import * as authService from "../services/authService";

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;
  const result = await authService.register({ name, email, password });
  res.status(201).json({ success: true, data: result });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  res.status(200).json({ success: true, data: result });
}

export async function logout(_req: Request, res: Response) {
  // On client, simply remove token. For server-side, can implement token blacklist if desired.
  res.json({ success: true, message: "Logged out" });
}

export async function googleLogin(req: Request, res: Response) {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ success: false, message: "idToken required" });
  const result = await authService.googleLogin(idToken);
  res.status(200).json({ success: true, data: result });
}

export async function facebookLogin(req: Request, res: Response) {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ success: false, message: "accessToken required" });
  const result = await authService.facebookLogin(accessToken);
  res.status(200).json({ success: true, data: result });
}

export async function googleRedirect(_req: Request, res: Response) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirect = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/google/callback`;
  const { generateState } = await import("../utils/oauthState");
  const state = generateState();
  // set state cookie for CSRF protection
  res.cookie("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 5 * 60 * 1000,
  });
  const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(
    clientId || ""
  )}&redirect_uri=${encodeURIComponent(redirect)}&scope=openid%20email%20profile&state=${encodeURIComponent(state)}`;
  res.redirect(url);
}

export async function googleCallback(req: Request, res: Response) {
  const code = req.query.code as string;
  const state = req.query.state as string;
  const cookieState = req.cookies?.oauth_state;
  if (!cookieState || !state || cookieState !== state) {
    return res.status(403).json({ success: false, message: "Invalid or missing OAuth state" });
  }
  // clear state cookie
  res.clearCookie("oauth_state");
  if (!code) return res.status(400).json({ success: false, message: "code required" });
  const result = await authService.googleCallback(code as string);
  // redirect to frontend with token
  const frontend = process.env.FRONTEND_URL || "http://localhost:3000";
  res.redirect(`${frontend}/auth/success?token=${result.token}`);
}

export async function facebookRedirect(_req: Request, res: Response) {
  const clientId = process.env.FACEBOOK_APP_ID;
  const redirect = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/facebook/callback`;
  const { generateState } = await import("../utils/oauthState");
  const state = generateState();
  res.cookie("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 5 * 60 * 1000,
  });
  const url = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${encodeURIComponent(
    clientId || ""
  )}&redirect_uri=${encodeURIComponent(redirect)}&scope=email,public_profile&state=${encodeURIComponent(state)}`;
  res.redirect(url);
}

export async function facebookCallback(req: Request, res: Response) {
  const code = req.query.code as string;
  const state = req.query.state as string;
  const cookieState = req.cookies?.oauth_state;
  if (!cookieState || !state || cookieState !== state) {
    return res.status(403).json({ success: false, message: "Invalid or missing OAuth state" });
  }
  res.clearCookie("oauth_state");
  if (!code) return res.status(400).json({ success: false, message: "code required" });
  const result = await authService.facebookCallback(code as string);
  const frontend = process.env.FRONTEND_URL || "http://localhost:3000";
  res.redirect(`${frontend}/auth/success?token=${result.token}`);
}
