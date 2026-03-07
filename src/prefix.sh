for file in dist/jssc.js dist/jssc.cjs dist/jssc.mjs index.js index.min.js dist/index.min.js worker.js worker.min.js dist/worker.js dist/worker.min.js; do
    printf "/*\n\n%s\n\n*/\n\n" "$(cat src/prefix.txt)" | cat - "$file" > temp.js && mv temp.js "$file"
done
