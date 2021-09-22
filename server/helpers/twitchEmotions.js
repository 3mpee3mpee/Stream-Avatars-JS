const twitchEmojiURL = (emotes) => {
    return new Promise((resolve, reject) => {
        let urls = [];
        try {
            let codes = Object.keys(emotes);
            for (const code of codes) {
                urls.push(`https://static-cdn.jtvnw.net/emoticons/v1/${code}/1.0`);
            }
            resolve(urls);
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = twitchEmojiURL;