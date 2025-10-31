// app/api/users/me/route.ts
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/get-or-create-user";

export async function GET() {
  try {
    // Only call currentUser() once
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pass clerkUser to avoid re-fetching
    const user = await getOrCreateUser(clerkUser);

    if (!user) {
      return NextResponse.json(
        { error: "Failed to get user information" },
        { status: 500 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
