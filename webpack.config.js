const path = require('path')
module.exports={
    entry : './function.js',
    mode : 'development',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname)
    }
}