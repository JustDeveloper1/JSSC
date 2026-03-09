for file in dist/jssc.js dist/jssc.cjs dist/jssc.mjs index.js index.min.js dist/index.min.js worker.js worker.min.js dist/worker.js dist/worker.min.js dist/cli.js dist/cli.min.js cli.js cli.min.js; do
    printf "/*\n\n%s\n\n*/\n\n" "$(cat src/prefix.txt)" | cat - "$file" > temp.js && mv temp.js "$file"
done

for file in dist/cli.min.js cli.min.js; do
    printf "#!/usr/bin/env node\n\n" | cat - "$file" > temp.js && mv temp.js "$file"
done
