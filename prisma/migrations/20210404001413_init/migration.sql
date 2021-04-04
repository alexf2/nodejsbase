-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "login" VARCHAR(64) NOT NULL,
    "password" VARCHAR(64) NOT NULL,
    "age" INTEGER NOT NULL,
    "isDeleted" BOOLEAN,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User.login_unique" ON "User"("login");
