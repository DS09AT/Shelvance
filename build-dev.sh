#! /usr/bin/env bash
set -e

outputFolder='_output/net8.0-dev'
devFolder='_output/net8.0-dev'

case "$(uname -s)" in
    CYGWIN*|MINGW32*|MINGW64*|MSYS*)
        os="windows"
        platform=Windows
        ;;
    *)
        os="posix"
        platform=Posix
        ;;
esac

RID="${RID:-win-x64}"
FRAMEWORK="${FRAMEWORK:-net8.0}"
SKIP_FRONTEND=false
SKIP_BACKEND=false
WATCH_MODE=false

ProgressStart()
{
    echo "Building: $1"
}

ProgressEnd()
{
    echo "Complete: $1"
}

ShowHelp()
{
    cat << EOF
Readarr Development Build Script

Usage: ./build-dev.sh [options]

Options:
    --backend-only       Build only backend
    --frontend-only      Build only frontend
    --watch              Watch mode (auto-rebuild)
    -r, --runtime RID    Runtime identifier (default: win-x64)
    -f, --framework FW   Framework version (default: net8.0)
    --clean              Clean before build
    -h, --help           Show this help

Examples:
    ./build-dev.sh
    ./build-dev.sh --backend-only
    ./build-dev.sh --watch

EOF
}

CleanDev()
{
    ProgressStart "Cleaning dev output"
    rm -rf "$devFolder"
    ProgressEnd "Clean complete"
}

CheckIfFullBuildNeeded()
{
    if [ ! -f "$devFolder/Readarr.Console.dll" ] || \
       [ ! -f "$devFolder/Readarr.Console.exe" ] || \
       [ ! -f "$devFolder/Readarr.Core.dll" ] || \
       [ ! -f "$devFolder/Readarr.Host.dll" ] || \
       [ ! -d "$devFolder/UI" ]; then
        echo "true"
    else
        echo "false"
    fi
}

BuildBackendFull()
{
    ProgressStart "Building backend (full)"
    
    mkdir -p "$devFolder"
    
    echo "  [1/2] Building & publishing Readarr.Console..."
    dotnet publish src/NzbDrone.Console/Readarr.Console.csproj \
        -c Debug \
        -r $RID \
        -f $FRAMEWORK \
        -p:Platform=$platform \
        -p:EnforceCodeStyleInBuild=false \
        -p:TreatWarningsAsErrors=false \
        --no-restore \
        -o "$devFolder" \
        -v minimal
    
    if [ $? -ne 0 ]; then
        echo "Failed to build Readarr.Console"
        return 1
    fi
    
    echo "  [2/2] Building & publishing Readarr.Update..."
    dotnet publish src/NzbDrone.Update/Readarr.Update.csproj \
        -c Debug \
        -r $RID \
        -f $FRAMEWORK \
        -p:Platform=$platform \
        -p:EnforceCodeStyleInBuild=false \
        -p:TreatWarningsAsErrors=false \
        --no-restore \
        -o "$devFolder/Readarr.Update" \
        -v minimal
    
    if [ $? -ne 0 ]; then
        echo "Failed to build Readarr.Update"
        return 1
    fi
    
    echo "  Copying platform-specific assemblies..."
    cp "_output/$FRAMEWORK/Readarr.Windows.dll" "$devFolder/" 2>/dev/null || true
    cp "_output/$FRAMEWORK/Readarr.Mono.dll" "$devFolder/" 2>/dev/null || true
    
    ProgressEnd "Backend build ($(date +%H:%M:%S))"
}

BuildBackendIncremental()
{
    echo "Skipping separate build step"
}

PublishBackend()
{
    ProgressStart "Building & publishing backend (incremental)"
    
    mkdir -p "$devFolder"
    
    echo "  [1/2] Publishing Readarr.Console..."
    dotnet publish src/NzbDrone.Console/Readarr.Console.csproj \
        -c Debug \
        -r $RID \
        -f $FRAMEWORK \
        -p:Platform=$platform \
        -p:EnforceCodeStyleInBuild=false \
        -p:TreatWarningsAsErrors=false \
        --no-restore \
        -o "$devFolder" \
        -v minimal
    
    if [ $? -ne 0 ]; then
        echo "Failed to publish Readarr.Console"
        return 1
    fi
    
    echo ""
    echo "  [2/2] Publishing Readarr.Update..."
    dotnet publish src/NzbDrone.Update/Readarr.Update.csproj \
        -c Debug \
        -r $RID \
        -f $FRAMEWORK \
        -p:Platform=$platform \
        -p:EnforceCodeStyleInBuild=false \
        -p:TreatWarningsAsErrors=false \
        --no-restore \
        -o "$devFolder/Readarr.Update" \
        -v minimal
    
    if [ $? -ne 0 ]; then
        echo "Failed to publish Readarr.Update"
        return 1
    fi
    
    echo "  Copying platform-specific assemblies..."
    cp "_output/$FRAMEWORK/Readarr.Windows.dll" "$devFolder/" 2>/dev/null || true
    cp "_output/$FRAMEWORK/Readarr.Mono.dll" "$devFolder/" 2>/dev/null || true
    
    ProgressEnd "Backend published to $devFolder/"
}

BuildFrontendIncremental()
{
    ProgressStart "Building frontend (incremental)"
    
    echo "  Running webpack..."
    export SKIP_TYPE_CHECK=true
    yarn webpack --config ./frontend/build/webpack.config.dev.js \
        --env development \
        --stats minimal
    
    if [ $? -ne 0 ]; then
        echo "Failed to build frontend"
        return 1
    fi
    
    echo "  Copying UI to $devFolder/UI..."
    if [ -d "_output/UI" ]; then
        mkdir -p "$devFolder/UI"
        cp -r _output/UI/* "$devFolder/UI/"
    fi
    
    ProgressEnd "Frontend build ($(date +%H:%M:%S))"
}

BuildFrontendFull()
{
    ProgressStart "Building frontend (full)"
    
    echo "  Running yarn build..."
    yarn run build --env development
    
    if [ $? -ne 0 ]; then
        echo "Failed to build frontend"
        return 1
    fi
    
    echo "  Copying UI to $devFolder/UI..."
    if [ -d "_output/UI" ]; then
        mkdir -p "$devFolder/UI"
        cp -r _output/UI/* "$devFolder/UI/"
    fi
    
    ProgressEnd "Frontend build ($(date +%H:%M:%S))"
}

RestoreDependencies()
{
    ProgressStart "Restoring dependencies"
    
    echo "  Restoring NuGet packages..."
    dotnet restore src/Readarr.sln -v minimal
    
    if [ $? -ne 0 ]; then
        echo "Failed to restore NuGet packages"
        return 1
    fi
    
    if [ ! -d "node_modules" ]; then
        echo "  Installing yarn packages..."
        yarn install --frozen-lockfile --network-timeout 120000
        
        if [ $? -ne 0 ]; then
            echo "Failed to install yarn packages"
            return 1
        fi
    else
        echo "  Yarn packages already installed"
    fi
    
    ProgressEnd "Dependencies restored"
}

WatchMode()
{
    echo "Watch mode enabled - Press Ctrl+C to stop"
    echo ""
    
    if [ "$SKIP_BACKEND" = false ]; then
        if [ ! -f "$devFolder/Readarr.Console.dll" ]; then
            RestoreDependencies
        fi
    fi
    
    if [ "$SKIP_BACKEND" = false ]; then
        PublishBackend
    fi
    
    if [ "$SKIP_FRONTEND" = false ]; then
        BuildFrontendIncremental
    fi
    
    echo ""
    echo "Initial build complete"
    echo "Output: $devFolder/"
    echo "Watching for file changes..."
    echo ""
    
    local PIDS=()
    local last_build=0
    local debounce_time=2
    
    if [ "$SKIP_BACKEND" = false ]; then
        echo "Backend: Watching C# files (polling every 2s)"
        (
            set +e
            
            local timestamp_file="/tmp/readarr-watch-timestamp-$$"
            touch "$timestamp_file"
            
            while true; do
                changed_files=$(find src/ -type f \
                    \( -name "*.cs" -o -name "*.csproj" \) \
                    -newer "$timestamp_file" \
                    ! -path "*/obj/*" \
                    ! -path "*/bin/*" \
                    ! -path "*Test*" \
                    ! -path "*Dummy*" \
                    2>/dev/null)
                
                if [ -n "$changed_files" ]; then
                    touch "$timestamp_file"
                    
                    first_file=$(echo "$changed_files" | head -n 1)
                    num_files=$(echo "$changed_files" | wc -l)
                    
                    echo ""
                    echo "Change detected: $(basename "$first_file")"
                    if [ "$num_files" -gt 1 ]; then
                        echo "  (and $((num_files - 1)) more file(s))"
                    fi
                    echo "Rebuilding..."
                    echo ""
                    
                    local build_start=$(date +%s)
                    local build_output
                    build_output=$(dotnet publish src/NzbDrone.Console/Readarr.Console.csproj \
                        -c Debug \
                        -r $RID \
                        -f $FRAMEWORK \
                        -p:Platform=$platform \
                        -p:EnforceCodeStyleInBuild=false \
                        -p:TreatWarningsAsErrors=false \
                        -o "$devFolder" \
                        -v minimal \
                        -nologo \
                        2>&1) || true
                    
                    local build_exit_code=$?
                    local build_end=$(date +%s)
                    local build_duration=$((build_end - build_start))
                    
                    local compiled_projects=$(echo "$build_output" | grep -E "^\s+[A-Za-z].*->.*\.dll$")
                    local publish_line=$(echo "$build_output" | grep -E "^\s+Readarr\.Console\s*->\s*.*net8.0-dev")
                    local errors=$(echo "$build_output" | grep -E "(error|warning)")
                    
                    if [ -n "$compiled_projects" ]; then
                        echo "Compiled projects:"
                        echo "$compiled_projects" | sed 's/^/  /'
                    else
                        echo "  No projects needed recompilation"
                    fi
                    
                    if [ -n "$publish_line" ]; then
                        echo ""
                        echo "Published to: $devFolder/"
                        cp "_output/$FRAMEWORK/Readarr.Windows.dll" "$devFolder/" 2>/dev/null || true
                        cp "_output/$FRAMEWORK/Readarr.Mono.dll" "$devFolder/" 2>/dev/null || true
                    fi
                    
                    if [ -n "$errors" ]; then
                        echo ""
                        echo "Issues:"
                        echo "$errors" | sed 's/^/  /'
                    fi
                    
                    echo ""
                    if [ $build_exit_code -eq 0 ]; then
                        echo "Build complete in ${build_duration}s ($(date +%H:%M:%S))"
                    else
                        echo "Build failed (exit code: $build_exit_code)"
                        echo "  Continuing to watch..."
                    fi
                fi
                
                sleep 2
            done
            
            rm -f "$timestamp_file"
        ) &
        local backend_pid=$!
        PIDS+=($backend_pid)
        echo "  Backend watcher PID: $backend_pid"
    fi
    
    if [ "$SKIP_FRONTEND" = false ]; then
        echo "Frontend: Webpack watch mode"
        (
            export SKIP_TYPE_CHECK=true
            yarn webpack --config ./frontend/build/webpack.config.dev.js \
                --env development \
                --watch \
                --stats minimal &
            local webpack_pid=$!
            
            while kill -0 $webpack_pid 2>/dev/null; do
                sleep 2
                if [ -d "_output/UI" ]; then
                    mkdir -p "$devFolder/UI"
                    if command -v rsync &> /dev/null; then
                        rsync -a --delete _output/UI/ "$devFolder/UI/" 2>/dev/null || true
                    else
                        cp -r _output/UI/* "$devFolder/UI/" 2>/dev/null || true
                    fi
                fi
            done
        ) &
        local frontend_pid=$!
        PIDS+=($frontend_pid)
        echo "  Frontend watcher PID: $frontend_pid"
    fi
    
    echo ""
    echo "Press Ctrl+C to stop"
    echo ""
    
    if [ ${#PIDS[@]} -eq 0 ]; then
        echo "Error: No watchers started"
        return 1
    fi
    
    echo "Active watchers: ${#PIDS[@]}"
    
    trap "echo ''; echo 'Stopping watchers...'; kill ${PIDS[@]} 2>/dev/null; exit 0" INT TERM
    
    while true; do
        local alive=0
        for pid in "${PIDS[@]}"; do
            if kill -0 $pid 2>/dev/null; then
                alive=$((alive + 1))
            fi
        done
        
        if [ $alive -eq 0 ]; then
            echo ""
            echo "All watchers stopped"
            break
        fi
        
        sleep 5
    done
}

CLEAN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --backend-only)
            SKIP_FRONTEND=true
            shift
            ;;
        --frontend-only)
            SKIP_BACKEND=true
            shift
            ;;
        --watch)
            WATCH_MODE=true
            shift
            ;;
        -r|--runtime)
            RID="$2"
            shift 2
            ;;
        -f|--framework)
            FRAMEWORK="$2"
            shift 2
            ;;
        --clean)
            CLEAN=true
            shift
            ;;
        -h|--help)
            ShowHelp
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            ShowHelp
            exit 1
            ;;
    esac
done

echo "Readarr Dev Build"
echo "  Platform: $os ($platform)"
echo "  Runtime: $RID"
echo "  Framework: $FRAMEWORK"
echo "  Output: $devFolder/"
echo ""

if [ "$CLEAN" = true ]; then
    CleanDev
fi

NEED_FULL_BUILD=$(CheckIfFullBuildNeeded)

if [ "$NEED_FULL_BUILD" = "true" ]; then
    echo "First time or missing files - performing full build"
    echo ""
    
    RestoreDependencies
    
    if [ "$SKIP_BACKEND" = false ]; then
        BuildBackendFull
    fi
    
    if [ "$SKIP_FRONTEND" = false ]; then
        BuildFrontendFull
    fi
else
    if [ "$WATCH_MODE" = true ]; then
        WatchMode
    else
        if [ "$SKIP_BACKEND" = false ]; then
            BuildBackendIncremental
            PublishBackend
        fi
        
        if [ "$SKIP_FRONTEND" = false ]; then
            BuildFrontendIncremental
        fi
    fi
fi

echo ""
echo "Dev build complete"
echo "Output: $devFolder/"

if [ "$os" = "windows" ]; then
    echo "Start: .\\$devFolder\\Readarr.exe"
else
    echo "Start: ./$devFolder/Readarr"
fi
