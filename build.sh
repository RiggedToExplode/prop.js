#! /bin/sh

VERSIONS=es2020
FIRSTVERSION=es2020
OPTIMIZATION=0
FINAL=0
TEST=0
DECLARATION=0


replaceline() {
    printf "\r\033[K$@"
}

newline() {
    printf "\n$@"
}

compile() {
    path=$1
    version=$2

    shift; shift

    tsc -t $version $@ $path

    if [ $? -ne 0 ]; then
        newline "tsc: Fatal error!\n"

        exit $?
    fi
}

compileVersions() {
    for version in $VERSIONS; do
        replaceline "Compiling file $2 ($3/$4) to ECMA version '$version' ($CURRVERSION/$VERSIONSLENGTH)..."
        
        CURRVERSION=$((CURRVERSION + 1))
        
        compile $1 $version --outDir versions/$version/$(dirname $2)

        if [ $? -ne 0 ]; then
            exit $?
        fi
    done

    CURRVERSION=1
}

compileWASM() {
    path=$1
    relativePath=$2
    dir=$3

    shift; shift; shift

    emcc -O$OPTIMIZATION -o $dir/$(echo $relativePath | sed 's/\..*/\.wasm/') $path $@

    if [ $? -ne 0 ]; then
        newline "emcc: Fatal error!\n"

        exit $?
    fi
}

generateDeclarations() {
    currDeclaration=1

    tsc -d --emitDeclarationOnly -t $FIRSTVERSION --outDir src/declarations -p src

    if [ $? -ne 0 ]; then
        newline "tsc: Fatal error while generating declarations!\n"

        exit $?
    fi
}


args=$(getopt dDTtfv:O: $*)

if [ "$?" -ne 0 ] || [ $# -eq 0 ]; then
    echo "Usage: $(basename $0) [-v versions] [-O optimization] [-ftTdD] file1 [file2 ...]"
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
            if [ $2 = "all" ]; then
                VERSIONS="es2020 es6 es2015 es2016 es2017 es2019 esnext"
            fi
            FIRSTVERSION=$(echo $VERSIONS | cut -d " " -f1)
            shift; shift
            ;;
        -O) 
            OPTIMIZATION=$2 
            shift; shift
            ;;
        -d)
            DECLARATION=1
            shift
            ;;
        -D)
            DECLARATION=2
            shift
            ;;
        --)
            shift; break
            ;;
    esac
done

VERSIONSLENGTH=$(echo $VERSIONS | wc -w)
CURRVERSION=1


printf "ECMA Targets: $VERSIONS"
newline "Primary Target: $FIRSTVERSION"

if [ $DECLARATION -eq 1 ]; then
    if [ $DECLARATION -eq 2 ]; then
        newline "Set to only generate TypeScript declaration files."
    else
        newline "Set to generate TypeScript declaration files."
    fi
fi

if [ $OPTIMIZATION -ne 0 ]; then
    newline "WASM Optimization: O$OPTIMIZATION"
fi

if [ $FINAL -ne 0 ]; then
    newline "Set to copy a final 'de-facto' version."
fi

if [ $TEST -eq 1 ]; then
    if [ $TEST -eq 2 ]; then
        newline "Set to compile only to test directory."
    else
        newline "Set to copy a test version to test directory."
    fi
fi

newline "\n"


if [ $DECLARATION -eq 2 ]; then
    replaceline "Generating declaration files for core framework..."

    generateDeclarations

    printf " Done!\n"

    exit $?
fi

if [ $DECLARATION -eq 1 ]; then
    newline "Generating declaration files for core framework..."
    generateDeclarations
fi


for version in $VERSIONS; do
    mkdir -p versions/$version/modules
done


currFile=1
filesLength=$#

for path in $@; do
    relativePath=$(echo $path | sed 's/.*src\///')

    case $(echo $path | awk -F . '{print $NF}') in
        ts) 
            if [ $TEST -eq 2 ]; then
                replaceline "Compiling file $relativepath ($currFile/$filesLength) to ECMA version '$FIRSTVERSION' for test directory..."
                
                compile $path $FIRSTVERSION --outDir test/$(dirname $relativePath)
                
                if [ $? -ne 0 ]; then
                    exit $?
                fi
            else
                compileVersions $path $relativePath $currFile $filesLength

                if [ $? -ne 0 ]; then
                    exit $?
                fi
            fi
            ;;

        c)  
            replaceline "Compiling file $relativePath ($currFile/$filesLength) to WebAssembly with optimization level O$OPTIMIZATION..."
            
            if [ $TEST -eq 2 ]; then
                mkdir -p test/$(dirname $relativePath)

                compileWASM $path $relativePath test --no-entry

                if [ $? -ne 0 ]; then
                    exit $?
                fi
            else
                mkdir -p $(dirname $relativePath)

                compileWASM $path $relativePath . --no-entry

                if [ $? -ne 0 ]; then
                    exit $?
                fi
            fi
            ;;

        *)  
            if [ "$(basename $relativePath)" = "core" ]; then
                if [ $TEST -eq 2 ]; then
                    replaceline "Compiling core framework files ($currFile/$filesLength) to ECMA version $FIRSTVERSION for test directory..."
                    
                    compile "" $FIRSTVERSION --outFile test/prop.js -p src
                    
                    if [ $? -ne 0 ]; then
                        printf "\n Fatal error while compiling core!\n"
                        
                        exit $?
                    fi
                else
                    for version in $VERSIONS; do
                        replaceline "Compiling core framework files ($currFile/$filesLength) to ECMA version $version ($CURRVERSION/$VERSIONSLENGTH)..."
                        
                        CURRVERSION=$((CURRVERSION + 1))
                        
                        compile "" $version --outFile versions/$version/prop.js -p src
                        
                        if [ $? -ne 0 ]; then
                            printf "\n Fatal error while compiling core!\n"

                            exit $?
                        fi
                    done

                    CURRVERSION=1
                fi
            else
                replaceline "Skipping unrecognized file $relativePath ($currFile/$filesLength)..."

                sleep 3
            fi
            ;;
    esac

    currFile=$((currFile + 1))
done

if [ $TEST -eq 1 ]; then
    newline "Copying files from versions/$FIRSTVERSION to test directory..."
    cp -rf versions/$FIRSTVERSION/modules test/
    cp -f versions/$FIRSTVERSION/prop.js test/prop.js
    cp -f prop.wasm test/prop.wasm
fi

if [ $FINAL -ne 0 ]; then
    newline "Copying files from versions/$FIRSTVERSION to root directory for a 'de-facto' version..."
    cp -rf versions/$FIRSTVERSION/modules ./
    cp -f versions/$FIRSTVERSION/prop.js prop.js
fi
    

printf " Done!\n"