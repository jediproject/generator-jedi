echo "Positional Parameters"
echo '$script to run = ' $1

npm link

cd gui/
npm run $1