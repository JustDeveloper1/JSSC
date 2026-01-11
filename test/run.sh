npm init --yes && \
jq '.main = "index.js" | .type = "commonjs"' package.json > temp.json && \ 
mv temp.json package.json

node test
