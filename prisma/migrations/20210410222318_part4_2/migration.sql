/*
  Warnings:

  - You are about to drop the `_GroupToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_GroupToUser" DROP CONSTRAINT "_GroupToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_GroupToUser" DROP CONSTRAINT "_GroupToUser_B_fkey";

-- DropTable
DROP TABLE "_GroupToUser";

-- CreateTable
CREATE TABLE "UserGroup" (
    "idUser" UUID NOT NULL,
    "idGroup" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGroup.idUser_idGroup_unique" ON "UserGroup"("idUser", "idGroup");

-- AddForeignKey
ALTER TABLE "UserGroup" ADD FOREIGN KEY ("idUser") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGroup" ADD FOREIGN KEY ("idGroup") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
