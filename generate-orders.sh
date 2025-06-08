#!/bin/zsh

# Script to generate orders with the new from/to structure

echo "🚚 FreightFox - Order Generation Script 📦"
echo "----------------------------------------"
echo "This script will populate your Firebase database with orders using the new from/to structure"
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install npm first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️ Warning: No .env file found. Firebase configuration might be missing."
    echo "Creating a sample .env file with placeholders..."
    cat > .env << EOL
# Firebase Configuration
VITE_FIREBASE_API=YOUR_API_KEY
VITE_FIREBASE_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
EOL
    echo "⚠️ Please update the .env file with your Firebase credentials and run this script again."
    exit 1
fi

# Run the order generation script
echo "🔄 Generating orders with new structure..."
npm run generate-orders

# Check the exit code of the npm command
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Process complete! Orders have been successfully created in Firebase."
else
    echo ""
    echo "❌ Error: Failed to generate orders. Please check the error messages above."
fi
