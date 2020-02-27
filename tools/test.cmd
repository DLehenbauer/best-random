@echo off

:: %RANDOM% returns an integer in the range [0..32,767], making for a maximum
:: seed of 3,276,732,767 (smaller than a 32b uint).
set SEED=%RANDOM%%RANDOM%

::call :Test uint32 %SEED%
call :Test uint53 %SEED%
exit /b 0

:Test
    set MODE=%1
    set SEED=%2
    cmd /C exit %SEED%
    set "HEX=%=ExitCode%"
    set SEEDASHEX=%HEX%

    echo *** %MODE%
    echo.
    ::..\node_modules\.bin\ts-node binout.js %MODE% %SEED% | RNG_Test.exe stdin -seed %SEEDASHEX% -multithreaded -tlshow 4KB -tlshow 8KB -tlshow 16KB -tlshow 32KB -tlshow 64KB -tlshow 256KB -tlmax 512KB -tlmax 1GB
    ..\node_modules\.bin\ts-node binout.js %MODE% %SEED% | RNG_Test.exe stdin -seed %SEEDASHEX% -tf 2 -te 1 -multithreaded
    echo.
    goto :EOF
