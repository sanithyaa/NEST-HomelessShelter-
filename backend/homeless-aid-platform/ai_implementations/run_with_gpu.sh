#!/bin/bash
# Script to run the Flask app with NVIDIA GPU enabled

# Set CUDA library paths
export LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH
export CUDA_VISIBLE_DEVICES=0

# Enable NVIDIA GPU for this process
export __NV_PRIME_RENDER_OFFLOAD=1
export __GLX_VENDOR_LIBRARY_NAME=nvidia

# Run the Flask app
python api/app.py
