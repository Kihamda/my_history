@echo off

REM Build the frontend
cd frontend
call npm run build
cd ..
REM Build the admin
cd staticSiteMarger
call npm run build

cd ..
REM RUN the backend
cd backend
call npm run dev