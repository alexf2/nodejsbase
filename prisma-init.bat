@echo off 

REM ������� ���� ��������� �������� DB ����� dbscripts/create-db.bat 

dotenv -e .env.development -- npx prisma migrate development --name init

REM ��������� ������� Prisma � seeding ��� �������������, ���� �� ���������� ������������� ��� ������ ��������
REM dotenv -e .env.development -- npx prisma generate
REM dotenv -e .env.development -- npx prisma db seed --preview-feature
