// module scaffolding
const generator = {};

/**
 * Generate String Value
 *
 * Generate a random string.
 *
 * @param {Number} numberOfChars Length of the generated string.
 *  Type must be number type else it will set the length 4.
 * @returns {String} random string
 */
generator.generateRandomString = (numberOfChars) => {
    const length = typeof numberOfChars === 'number' ? numberOfChars : 4;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let returnValue = '';
    for (var i = 0; i < length; i++) {
        returnValue += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }
    return returnValue;
};

module.exports = generator;
