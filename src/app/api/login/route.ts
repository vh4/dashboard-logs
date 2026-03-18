import { NextRequest, NextResponse } from "next/server";

const IOTERA_LOGIN_URL =
  "https://asia-southeast2-iotera-vending.cloudfunctions.net/login";
const API_KEY = "zrgKDf0NHel6EKhnpe5YnB0DSJILznX2";
const DEVICE_ID = "0F213591-A75E-4609-AD1D-3F8631CFB34B";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    const response = await fetch(IOTERA_LOGIN_URL, {
      method: "POST",
      headers: {
        "X-INTERNAL-GAE-CONNECTION-API-KEY": API_KEY,
        "X-DEVICE-ID": DEVICE_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
