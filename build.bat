@echo off

REM Build the frontend
pushd frontend
call npm run build
if errorlevel 1 (
    echo [ERROR] Frontend build failed.
    popd
    exit /b 1
)
popd
REM Build the admin
pushd staticSiteMarger
call npm run build
if errorlevel 1 (
    echo [ERROR] Admin build failed.
    popd
    exit /b 1
)
popd
REM RUN the backend
pushd backend
call npm run dev
if errorlevel 1 (
    echo [ERROR] Backend failed to start or exited with an error.
    popd
    exit /b 1
)
popd