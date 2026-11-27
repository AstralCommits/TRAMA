@echo off
rem Liga o front do TRAMA (demonstracao) e religa sozinho se ele fechar. Registro em logs\web.log
cd /d "C:\trama-demo\web"
set NODE_ENV=production
set HOST=127.0.0.1
set PORT=13000
:loop
echo [%date% %time%] iniciando o front >> "C:\trama-demo\logs\web.log"
"C:\trama-demo\node\node.exe" "C:\trama-demo\web\node_modules\@react-router\serve\bin.cjs" "./build/server/index.js" >> "C:\trama-demo\logs\web.log" 2>&1
echo [%date% %time%] o front fechou (codigo %errorlevel%), religando em 10s >> "C:\trama-demo\logs\web.log"
ping -n 11 127.0.0.1 >nul
goto loop
