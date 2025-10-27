    -- CreateEnum
    CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ORGANIZER', 'ATTENDEE');

    -- CreateEnum
    CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');

    -- CreateTable
    CREATE TABLE "User" (
        "id" TEXT NOT NULL,
        "clerkId" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "firstName" TEXT,
        "lastName" TEXT,
        "role" "UserRole" NOT NULL DEFAULT 'ATTENDEE',
        "imageUrl" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "Event" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "imageUrl" TEXT,
        "location" TEXT NOT NULL,
        "venue" TEXT,
        "startDate" TIMESTAMP(3) NOT NULL,
        "endDate" TIMESTAMP(3) NOT NULL,
        "capacity" INTEGER NOT NULL,
        "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
        "organizerId" TEXT NOT NULL,
        "creatorId" TEXT NOT NULL,
        "categoryId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "Category" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "description" TEXT,
        "color" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
    );

    -- CreateTable
    CREATE TABLE "Registration" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "eventId" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
    );

    -- CreateIndex
    CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

    -- CreateIndex
    CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

    -- CreateIndex
    CREATE INDEX "Event_organizerId_idx" ON "Event"("organizerId");

    -- CreateIndex
    CREATE INDEX "Event_status_idx" ON "Event"("status");

    -- CreateIndex
    CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

    -- CreateIndex
    CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

    -- CreateIndex
    CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

    -- CreateIndex
    CREATE INDEX "Registration_userId_idx" ON "Registration"("userId");

    -- CreateIndex
    CREATE INDEX "Registration_eventId_idx" ON "Registration"("eventId");

    -- CreateIndex
    CREATE UNIQUE INDEX "Registration_userId_eventId_key" ON "Registration"("userId", "eventId");

    -- AddForeignKey
    ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "Event" ADD CONSTRAINT "Event_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "Event" ADD CONSTRAINT "Event_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "Registration" ADD CONSTRAINT "Registration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    -- AddForeignKey
    ALTER TABLE "Registration" ADD CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
