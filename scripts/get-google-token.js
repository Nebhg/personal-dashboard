#!/usr/bin/env node
/**
 * One-time script to get a Google OAuth2 refresh token.
 * Run with: node scripts/get-google-token.js
 * Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const { google } = require("googleapis");

// Load .env.local
const envPath = path.join(__dirname, "../.env.local");
if (!fs.existsSync(envPath)) {
  console.error("ERROR: .env.local not found"); process.exit(1);
}
fs.readFileSync(envPath, "utf-8").split("\n").forEach((line) => {
  const idx = line.indexOf("=");
  if (idx > 0) process.env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
});

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error("ERROR: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing from .env.local");
  process.exit(1);
}

const REDIRECT = "http://localhost:8085";

const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/calendar"],
  prompt: "select_account consent",
});

// Spin up a local server to catch the OAuth callback
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    res.end(`<h2>Error: ${error}</h2><p>Close this tab and try again.</p>`);
    server.close();
    return;
  }

  if (!code) {
    res.end("<p>Waiting...</p>");
    return;
  }

  res.end(`<h2 style="font-family:sans-serif;color:green">✅ Authorised! Check your terminal.</h2><p>You can close this tab.</p>`);

  try {
    const { tokens } = await oauth2Client.getToken(code);
    server.close();

    if (!tokens.refresh_token) {
      console.error("\nERROR: No refresh_token returned.");
      console.error("Go to https://myaccount.google.com/permissions, revoke access for this app, then run the script again.");
      process.exit(1);
    }

    console.log("\n✅ Success! Add this line to your .env.local:\n");
    console.log("GOOGLE_REFRESH_TOKEN=" + tokens.refresh_token);
    console.log("\nDone — restart your dashboard server after updating .env.local.");
  } catch (err) {
    console.error("\nERROR exchanging code:", err.message);
    server.close();
    process.exit(1);
  }
});

server.listen(8085, () => {
  console.log("\n─────────────────────────────────────────────────────");
  console.log("  Open this URL in your browser (pick the RIGHT account):");
  console.log("─────────────────────────────────────────────────────");
  console.log(authUrl);
  console.log("\nWaiting for Google to redirect back...");
});
