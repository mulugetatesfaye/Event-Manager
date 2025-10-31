// lib/get-or-create-user.ts
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import type { User as ClerkUser } from "@clerk/nextjs/server";

export async function getOrCreateUser(clerkUser?: ClerkUser | null) {
  // Only fetch if not provided
  const user = clerkUser ?? (await currentUser());

  if (!user) {
    return null;
  }

  // Try to find existing user
  let dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  // If user doesn't exist, create them
  if (!dbUser) {
    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      throw new Error("No email found for user");
    }

    dbUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        email,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        imageUrl: user.imageUrl || null,
        role: UserRole.ATTENDEE,
      },
    });
  }

  return dbUser;
}
