module.exports = {
  "env": {
      "commonjs": true,
      "es6": true,
      "node": true
  },
  "extends": "google",
  "globals": {
      "Atomics": "readonly",
      "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
      "ecmaVersion": 2018
  },
  "rules": {
    "require-jsdoc" : 0,
    "max-len": ["error", { "code": 90 } ]
  }
};