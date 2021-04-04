@echo off 

REM сначала надо выполнить создание DB через dbscripts/create-db.bat 

dotenv -e .env.development -- npx prisma migrate development --name init

REM генерацию клиента Prisma и seeding при необходимости, если не выполнится автоматически при первой миграции
REM dotenv -e .env.development -- npx prisma generate
REM dotenv -e .env.development -- npx prisma db seed --preview-feature
