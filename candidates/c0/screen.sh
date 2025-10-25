#!/bin/bash

# Create a new tmux session with 10 equally sized panels
# Layout: 2 rows x 5 columns
# Running various TestU01 and other RNG tests

# Start a new tmux session (detached)
SESSION_NAME="rng-screen"

# Check if session already exists
tmux has-session -t $SESSION_NAME 2>/dev/null

if [ $? == 0 ]; then
    echo "Session '$SESSION_NAME' already exists. Attaching..."
    tmux attach-session -t $SESSION_NAME
    exit 0
fi

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RNG_DIR="$SCRIPT_DIR/rng"

# Clean build the RNG
echo "Clean building RNG..."
cd "$RNG_DIR"
make clean
make

# Create logs directory
LOGS_DIR="$SCRIPT_DIR/logs"
rm -rf "$LOGS_DIR"
mkdir -p "$LOGS_DIR"

# Cat rng.h to rng.log
echo "Saving rng.h to rng.log..."
cat "$RNG_DIR/rng.h" > "$LOGS_DIR/rng.log"

# Create new session with first window
tmux new-session -d -s $SESSION_NAME

# Split into 2 rows first
tmux split-window -v -t $SESSION_NAME

# Split top row into 5 columns
tmux select-pane -t $SESSION_NAME:0.0
tmux split-window -h
tmux select-pane -t $SESSION_NAME:0.0
tmux split-window -h
tmux select-pane -t $SESSION_NAME:0.2
tmux split-window -h
tmux select-pane -t $SESSION_NAME:0.3
tmux split-window -h

# Split bottom row into 5 columns
tmux select-pane -t $SESSION_NAME:0.5
tmux split-window -h
tmux select-pane -t $SESSION_NAME:0.5
tmux split-window -h
tmux select-pane -t $SESSION_NAME:0.7
tmux split-window -h
tmux select-pane -t $SESSION_NAME:0.8
tmux split-window -h

# Define paths
TOOLS_DIR="$SCRIPT_DIR/../../tools"
RNG_EXEC="$RNG_DIR/rng"

# Now send commands to each pane
# Panel layout (0-indexed):
# 0  1  2  3  4
# 5  6  7  8  9

# Column 1: Adaptive Crush Interleaved
# Top (pane 0): Adaptive Crush Interleaved
tmux send-keys -t $SESSION_NAME:0.0 "cd '$TOOLS_DIR/TestU01' && { '$RNG_EXEC' -i 2> '$LOGS_DIR/bc.log' | stdbuf -oL ./TestU01_stdin -b -x 100; } 2>&1 | tee -a '$LOGS_DIR/bc.log'" C-m

# Bottom (pane 5): Adaptive Crush Interleaved Reversed
tmux send-keys -t $SESSION_NAME:0.5 "cd '$TOOLS_DIR/TestU01' && { '$RNG_EXEC' -i 2> '$LOGS_DIR/bcr.log' | stdbuf -oL ./TestU01_stdin -b -x 100 -r; } 2>&1 | tee -a '$LOGS_DIR/bcr.log'" C-m

# Column 2: Adaptive Crush Hi32
# Top (pane 1): Adaptive Crush Hi32
tmux send-keys -t $SESSION_NAME:0.1 "cd '$TOOLS_DIR/TestU01' && { '$RNG_EXEC' -i 2> '$LOGS_DIR/bch.log' | stdbuf -oL ./TestU01_stdin -b -x 100 -h; } 2>&1 | tee -a '$LOGS_DIR/bch.log'" C-m

# Bottom (pane 6): Adaptive Crush Hi32 Reversed
tmux send-keys -t $SESSION_NAME:0.6 "cd '$TOOLS_DIR/TestU01' && { '$RNG_EXEC' -i 2> '$LOGS_DIR/bchr.log' | stdbuf -oL ./TestU01_stdin -b -x 100 -h -r; } 2>&1 | tee -a '$LOGS_DIR/bchr.log'" C-m

# Column 3: Adaptive Crush Lo32
# Top (pane 2): Adaptive Crush Lo32
tmux send-keys -t $SESSION_NAME:0.2 "cd '$TOOLS_DIR/TestU01' && { '$RNG_EXEC' -i 2> '$LOGS_DIR/bcl.log' | stdbuf -oL ./TestU01_stdin -b -x 100 -l; } 2>&1 | tee -a '$LOGS_DIR/bcl.log'" C-m

# Bottom (pane 7): Adaptive Crush Lo32 Reversed
tmux send-keys -t $SESSION_NAME:0.7 "cd '$TOOLS_DIR/TestU01' && { '$RNG_EXEC' -i 2> '$LOGS_DIR/bclr.log' | stdbuf -oL ./TestU01_stdin -b -x 100 -l -r; } 2>&1 | tee -a '$LOGS_DIR/bclr.log'" C-m

# Column 4: HWD
# Top (pane 3): HWD
tmux send-keys -t $SESSION_NAME:0.3 "cd '$TOOLS_DIR/hwd' && { '$RNG_EXEC' -i 2> '$LOGS_DIR/hwd.log' | stdbuf -oL ./hwd --low-pv=1e-20; } 2>&1 | tee -a '$LOGS_DIR/hwd.log'" C-m

# Bottom (pane 8): HWD with -t
tmux send-keys -t $SESSION_NAME:0.8 "cd '$TOOLS_DIR/hwd' && { '$RNG_EXEC' -i 2> '$LOGS_DIR/hwd-t.log' | stdbuf -oL ./hwd -t --low-pv=1e-20; } 2>&1 | tee -a '$LOGS_DIR/hwd-t.log'" C-m

# Column 5: PractRand
# Top (pane 4): PractRand
tmux send-keys -t $SESSION_NAME:0.4 "cd '$TOOLS_DIR/PractRand' && { '$RNG_EXEC' -i 2> '$LOGS_DIR/pr.log' | stdbuf -oL ./RNG_test stdin64 -tlmax 8192PB; } 2>&1 | tee -a '$LOGS_DIR/pr.log'" C-m

# Bottom (pane 9): PractRand with -te 1 -tf 2
tmux send-keys -t $SESSION_NAME:0.9 "cd '$TOOLS_DIR/PractRand' && { '$RNG_EXEC' -i 2> '$LOGS_DIR/pr-te1-tf2.log' | stdbuf -oL ./RNG_test stdin64 -te 1 -tf 2 -tlmax 8192PB; } 2>&1 | tee -a '$LOGS_DIR/pr-te1-tf2.log'" C-m

# Select the first pane
tmux select-pane -t $SESSION_NAME:0.0

# Attach to the session
tmux attach-session -t $SESSION_NAME
