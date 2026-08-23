const { nanoid } = require("nanoid");

function redirectLinkCreating() {

    const id = nanoid(8);
    return id

}

module.exports = redirectLinkCreating