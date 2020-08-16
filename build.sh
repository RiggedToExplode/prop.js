#! /bin/bash

VERSIONS=es2020
FIRSTVERSION=es2020
OPTIMIZATION=0
FINAL=0
TEST=0

args=$(getopt Ttfv:O: $*)

if [ $? -ne 0 ] || [ "$1" == "" ]; then
    echo "Usage: $(basename $0) [-v versions] [-O optimization] [-ftT] file1 [file2 ...]"
    exit 2
fi

set -- $args

while :; do
    case "$1" in
        -t) 
            TEST=1 
            shift
            ;;
        -T)
            TEST=2
            shift
            ;;
        -f) 
            FINAL=1
            shift
            ;;
        -v) 
            VERSIONS=$(echo "$2" | sed "s/,/ /g")
            if [ "$2" == "all" ]; then
                VERSIONS="es2020 es6 es2015 es2016 es2017 es2019 esnext"
            fi
            FIRSTVERSION=$(echo $VERSIONS | cut -d " " -f1)
            shift; shift
            ;;
        -O) 
            OPTIMIZATION=$2 
            shift; shift
            ;;
        --)
            shift; break
            ;;
    esac
done

printf "ECMA Targets: $VERSIONS\n"
printf "Primary Target: $FIRSTVERSION\n"
if [ "$OPTIMIZATION" -ne "0" ]; then
    printf "WASM Optimization: O$OPTIMIZATION\n"
fi
if [ "$FINAL" -ne "0" ]; then
    printf "Set to copy a final 'de-facto' version.\n"
fi
if [ "$TEST" == "1" ]; then
    printf "Set to copy a test version to test directory.\n"
fi
if [ "$TEST" == "2" ]; then
    printf "Set to compile only to test directory.\n"
fi
printf \n

FILESLENGTH=$#
VERSIONSLENGTH=$(echo $VERSIONS | wc -w)
CURRVERSION=1
CURRFILE=1

for version in $VERSIONS; do
    mkdir -p versions/$version/modules
done

for path in $@; do
    RELATIVEPATH=$(echo $path | sed 's/.*src\///')
    case $(echo $path | awk -F . '{print $NF}') in
        ts) 
            if [ "$TEST" == "2" ]; then
                printf "\r\033[KCompiling file $RELATIVEPATH ($CURRFILE/$FILESLENGTH) to ECMA version '$version' for test directory..."
                tsc -t $FIRSTVERSION --outDir test/ $path
            else
                for version in $VERSIONS; do
                    printf "\r\033[KCompiling file $RELATIVEPATH ($CURRFILE/$FILESLENGTH) to ECMA version '$version' ($CURRVERSION/$VERSIONSLENGTH)..."
                    CURRVERSION=$((CURRVERSION + 1))
                    tsc -t $version --outDir versions/$version/ $path
                done
                CURRVERSION=1
            fi
            ;;
        c)  
            printf "\r\033[KCompiling file $RELATIVEPATH ($CURRFILE/$FILESLENGTH) to WebAssembly with optimization level O$OPTIMIZATION..."
            mkdir -p $(dirname $RELATIVEPATH)
            emcc -O$OPTIMIZATION --no-entry $path -o $(echo $RELATIVEPATH | sed 's/\..*/\.wasm/')
            ;;
        ?)  
            printf "\r\033[KSkipping unrecognized file $RELATIVEPATH ($CURRFILE/$FILESLENGTH)..."
            sleep 5
            ;;
    esac
    CURRFILE=$((CURRFILE + 1))
done

if [ "$TEST" == "1" ]; then
    printf "\r\033[KCopying files from versions/$FIRSTVERSION to test directory..."
    cp -rf versions/$FIRSTVERSION/modules test/
    cp -f versions/$FIRSTVERSION/prop.js test/prop.js
    cp -f prop.wasm test/prop.wasm
fi

if [ "$FINAL" -ne "0" ]; then
    printf "\r\033[KCopying files from versions/$FIRSTVERSION to root directory for a 'de-facto' version..."
    cp -rf versions/$FIRSTVERSION/modules modules
    cp -f versions/$FIRSTVERSION/prop.js prop.js
fi

printf " Done!\n"