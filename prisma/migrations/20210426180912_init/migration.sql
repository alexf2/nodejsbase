-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('READ', 'WRITE', 'DELETE', 'SHARE', 'UPLOAD_FILES');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "login" VARCHAR(64) NOT NULL,
    "password" VARCHAR(64) NOT NULL,
    "age" INTEGER NOT NULL,
    "isDeleted" BOOLEAN,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" UUID NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "permissions" "Permission"[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGroup" (
    "idUser" UUID NOT NULL,
    "idGroup" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User.login_unique" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "Group.name_unique" ON "Group"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserGroup.idUser_idGroup_unique" ON "UserGroup"("idUser", "idGroup");

-- AddForeignKey
ALTER TABLE "UserGroup" ADD FOREIGN KEY ("idUser") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "UserGroup" ADD FOREIGN KEY ("idGroup") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
