require("ts-node/register")

const { setup } = require("./setup")

module.export = async function() {
    await setup()
    return null
}