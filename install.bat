
cd %~dp0_cpp_modules\node-webengine-hosting
call npm install
call npm run build

cd %~dp0server
call npm install
call npm run build

cd %~dp0web
call npm install
call npm run build
