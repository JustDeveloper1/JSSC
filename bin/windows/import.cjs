if (process.platform !== "win32") module.exports = {
    compress: () => {},
    message : () => {}
};

const { compress } = require("./ui");
const { message } = require("./message");

module.exports = {
    compress,
    message
};
