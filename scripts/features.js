/** @param {HTMLButtonElement} btn */
function addArea(btn) {
    const area = strToElement(`
        <section>
            <input type="text" placeholder="追加したい動画のID" class="add-video-input">
            <button class="add-video-btn" onclick="addVideo(this)">動画を追加</button>
            <button onclick="YouTubeAPI.play(this)">再生</button>
            <button onclick="YouTubeAPI.pause(this)">停止</button>
        </section>
    `);
    document.querySelector('main').insertBefore(area, btn);
    new Player(area);
}

/** @param {HTMLButtonElement} btn */
async function addVideo(btn) {
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
    inputElem.value = '';

    const parent = strToElement(`<div class="video-container"></div>`)
    btn.parentElement.append(parent);
    await YouTubeAPI.getPlayer(btn.parentElement).addVideo(videoId, parent);
}