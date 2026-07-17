#!/bin/bash

STORAGE_PATH="/home/deploy/747civilbarb/writer/workspace-9xK2mP/data/storage-folder"

echo "Fixing permissions for: $STORAGE_PATH"

# Change ownership to deploy
sudo chown -R deploy:deploy "$STORAGE_PATH"

# Create missing references.json
if [ ! -f "$STORAGE_PATH/references.json" ]; then
    echo '{}' | sudo tee "$STORAGE_PATH/references.json"
fi

# Set directory permissions (755)
sudo find "$STORAGE_PATH" -type d -exec chmod 755 {} \;

# Set file permissions (664)
sudo find "$STORAGE_PATH" -type f -exec chmod 664 {} \;

# Create YOUR folder structure (matching your tree)
cd "$STORAGE_PATH"
sudo mkdir -p step0-drafts
sudo mkdir -p step1-drafts-accessible
sudo mkdir -p step2-in-progress
sudo mkdir -p step3-to-review
sudo mkdir -p step4-published

echo "✅ Permissions fixed!"
echo ""
echo "Folder structure:"
ls -la "$STORAGE_PATH"
EOF



