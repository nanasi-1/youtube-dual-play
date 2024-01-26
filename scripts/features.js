function addSection() {
    const buttons = strToElement(`
        <div>
            <button onclick="YouTubeAPI.play(this)">再生</button>
            <button onclick="YouTubeAPI.pause(this)">停止</button>
        </div>
    `);
    document.querySelector('main').append(buttons);
}

/** @param {HTMLButtonElement} btn */
function addVideo(btn) {
    if(btn===void 0) {
        console.warn('第一引数が空です');
        return;
    }
    /** @type {HTMLInputElement} */ const inputElem = btn.previousElementSibling;
    if(inputElem===null) {
        console.warn(`inputタグが見つかりませんでした`, btn);
        return;
    }
    if(inputElem.tagName!=='INPUT') {
        console.warn(`btnタグの直前がinputじゃありませんでした`, btn, inputElem);
        return;
    }
    if(btn.parentElement.tagName!=='SECTION') {
        console.warn(`btnタグの親がsectionじゃありませんでした`, btn.parentElement. btn);
        return;
    }
    const videoId = inputElem.value;
    YouTubeAPI.getPlayer(btn.parentElement).addVideo(videoId);
}