#!/bin/zsh
# Generate orders with proper structure for FreightFox

# Show header
echo "🚚 FreightFox - Order Generation Tool 📦"
echo "----------------------------------------"
echo "This script will populate your Firebase database with test orders"
echo ""

# Navigate to project root directory (assuming this script is run from anywhere)
cd "$(dirname "$0")/../.."

# Check for nodejs and npm
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️ Warning: No .env file found. Firebase connection may fail."
    echo "Would you like to create a basic .env file? (y/n)"
    read answer
    if [[ $answer == "y" || $answer == "Y" ]]; then
        echo "Creating .env file..."
        cat > .env << EOF
VITE_FIREBASE_API=your-api-key-here
VITE_FIREBASE_DOMAIN=your-auth-domain-here
VITE_FIREBASE_PROJECT_ID=your-project-id-here
VITE_FIREBASE_STORAGE=your-storage-bucket-here
VITE_FIREBASE_MESSAGING=your-messaging-sender-id-here
VITE_FIREBASE_APP_ID=your-app-id-here
EOF
        echo "✅ Created .env file. Please edit it with your Firebase details before continuing."
        exit 0
    fi
fi

# Run the order generator
echo "Running order generator..."
npm run generate-orders

# Exit with the same code as the npm command
exit $?
