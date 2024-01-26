class Area {
    #player;
    /** @type {HTMLElement} */ #element;
    constructor() {
        this.#element = strToElement(`
            <section>
                <input type="text" placeholder="追加したい動画のID" class="add-video-input">
                <button class="add-video-btn" onclick="AreaList.addVideo(this)">動画を追加</button>
                <button onclick="YouTubeAPI.play(this)">再生</button>
                <button onclick="YouTubeAPI.pause(this)">停止</button>
                <button class="area-remove-btn">×</button>
            </section>
        `);;
        this.#player = new Player(this.#element);

        // 削除処理
        this.#element.querySelector('.area-remove-btn').addEventListener('click', () => {
            if (confirm('エリアを削除しますか？')) this.remove();
        });
    }
    get element() {
        return this.#element;
    }
    get player() {
        return this.#player;
    }

    async addVideo(videoId) {
        const parent = strToElement(`<div class="video-container"></div>`)
        this.#element.append(parent);
        await this.#player.addVideo(videoId, parent);
    }

    remove() {
        AreaList.removeArea(this.element);
    }
}

class AreaList {
    /** @param {HTMLButtonElement} btn */
    static async addVideo(btn) {
        if (btn === void 0) {
            console.warn('第一引数が空です');
            return;
        }

        /** @type {HTMLInputElement} */
        const inputElem = btn.previousElementSibling;
        if (inputElem === null) {
            console.warn(`inputタグが見つかりませんでした`, btn);
            return;
        }
        if (inputElem.tagName !== 'INPUT') {
            console.warn(`btnタグの直前がinputじゃありませんでした`, btn, inputElem);
            return;
        }
        if (btn.parentElement.tagName !== 'SECTION') {
            console.warn(`btnタグの親がsectionじゃありませんでした`, btn.parentElement.btn);
            return;
        }

        // inputタグの中身を消す
        const videoId = inputElem.value;
        inputElem.value = '';
        if (!videoId) return;

        AreaList.getArea(btn.parentElement).addVideo(videoId);
    }

    /** @type {Map<HTMLElement, Area>} */ static #areaMap = new Map();
    static addArea() {
        const area = new Area();
        const addAreaBtn = document.getElementById('add-area-btn');
        document.querySelector('main').insertBefore(area.element, addAreaBtn);
        this.#areaMap.set(area.element, area);
        return area;
    }

    static getArea(elem) {
        return this.#areaMap.get(elem) || null;
    }

    static removeArea(elem) {
        const area = this.getArea(elem);
        if (area === null) {
            console.warn('エリアが見つかりませんでした');
            return;
        }
        YouTubeAPI.removePlayer(area.element);
        area.element.remove();
    }
}