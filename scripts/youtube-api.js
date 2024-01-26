// 読み込みはHTMLでやることにした

/**
 * @typedef Pr 動画のオブジェクト
 * @prop {() => Pr} playVideo
 * @prop {() => Pr} pauseVideo
 * @prop {(num: number) => Pr} seekTo
 * @prop {() => HTMLIFrameElement} getIframe
 * @prop {() => Pr} destroy
 * @prop {() => number} getDuration
 */

'use strict';
class Player {
    /** @type {HTMLElement} */ parent;
    /** @type {Map<string, Pr>} */ videos = new Map();
    /** @type {Set<string>} */ loadings = new Set(); // 読み込み中の管理、setを使ってみた
    
    /** @param {HTMLElement} parent */
    constructor(parent) {
        if(!parent) throw new Error(`${parent}をparentに使うことはできません`);
        
        this.parent = parent;
        YouTubeAPI.setPlayer = [parent, this];
        console.debug('YouTubeAPI: プレーヤーが追加されました');
    };

    async addVideo(id, parent=this.parent) {
        // 現在読み込み中ならreturn
        if(this.loadings.has(id)) return false;

        // (playerMap上に)すでに存在していたら削除
        if(YouTubeAPI.getVideo(id)) YouTubeAPI.removeVideo(id);

        // document内にそのidの要素があればエラー(想定外の事態防止)
        if (document.getElementById(id)) throw new Error(`id="${id}" がついている要素がすでに存在します。
        そのidがついた要素がないか確認するか、プレーヤーを作り直してください。`);

        this.loadings.add(id); // 読み込み中に追加
        
        // divを追加
        parent.append(strToElement(`<div id="${id}"></div>`));

        const pr = await this.#replaceVideo(id);
        this.videos.set(id, pr);
        console.debug('動画が追加されました');

        this.loadings.delete(id); // 読み込み中から削除
        return pr;
    };

    deleteVideo(id) { // 動画を削除
        if(!this.videos.has(id)) {
            console.warn(`${id}という動画は見つかりませんでした`);
            return;
        }

        document.getElementById(id).remove();
        this.videos.get(id).destroy();
        this.videos.delete(id);

        return this;
    };

    clearVideo() { // 動画をすべて削除
        for (const id of this.videos.keys()) { // idが欲しいだけ
            this.deleteVideo(id);
        }
    }

    play() {
        for (const pr of this.videos.values()) {
            pr.playVideo();
        }
    };
    pause() {
        for (const pr of this.videos.values()) {
            pr.pauseVideo();
        }
    };
    seekTo(num) {
        for (const pr of this.videos.values()) {
            pr.seekTo(num, true);
        }
    };

    /** これはpromiseを返すだけ @returns {Promise<Pr>}  */
    #replaceVideo(id) {
        return new Promise((resolve, reject) => {
            /** @type {Pr} */
            const pr = new YT.Player(id, {
                videoId: id,
                playerVars: {
                    playlist: id,
                    loop: 1 // ループ
                },
                events: {
                    'onReady': () => { // これがあって良かった
                        resolve(pr);
                    }
                }
            });
        });
    };
}


// HTMLのボタンで実際に使うやつ
class YouTubeAPI {
    // インスタンス化防止
    constructor() { throw new Error('このクラスはインスタンスにしないでください')};

    static #isAPILoaded = false; // APIが読み込まれているかどうか

    /** @param {boolean} bool */
    static set isAPILoaded(bool) {
        // これはセッター
        this.#isAPILoaded = bool;
        dispatchEvent(new CustomEvent('YouTubeAPILoaded'));
    }

    static async APILoad() { // APIのscriptタグを読み込む関数
        // リファレンスのコピペ
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        // 参考：　https://knmts.com/as-a-engineer-101/
        // promiseの中にaddEを入れるっぽい
        return new Promise((resolve, reject) => {
            addEventListener('YouTubeAPILoaded', resolve);
        })
    }

    /** @type {Map<HTMLElement, Player>} */
    static #playerMap = new Map(); // 全体を管理するMap

    /** @type {(ids: string[], btn: HTMLButtonElement, done?: (videos: Pr[],player: Player) => void) => Player} */ 
    static async add (ids, btn, done) {
        if(!this.#isAPILoaded) {await this.APILoad();} // APIを読み込む

        const par = btn?.parentElement || document.body;
        const player = this.getPlayer(par) || new Player(par);

        const loadingVideos = []; // その回に読み込んだ動画一覧、連打バグ防止
        for (const id of ids) {
            const result = await player.addVideo(id);
            if(result) loadingVideos.push(result);
        }
        
        player.play(); // 結局こっちにした
        if(done) done(loadingVideos, player); // doneは追加完了後に実行する関数
    };

    /** @param {HTMLButtonElement} btn */
    static play(btn) {
        const player = this.getPlayer(btn.parentElement.parentElement);
        if(!player) return; // 空の場合はさようなら

        player.play();
    };

    /** @param {HTMLButtonElement} btn */
    static pause(btn) {
        const player = this.getPlayer(btn.parentElement.parentElement);
        if(!player) return; // 空の場合はさようなら

        player.pause();
    };

    /** @param {HTMLInputElement} input  */
    static seek(input) {
        const player = this.getPlayer(input.parentElement);
        if(!player) return; // 空の場合はさようなら

        input.name = 'youtube-api-seek' // もうこれでいいや

        // 一番最初の動画の長さ
        const length = [...player.videos.values()][0].getDuration();
        const second = input.value / 100 * length;

        const elem = input.nextElementSibling.tagName === 'LABEL' ? input.nextElementSibling : strToElement(`<label for=${input.name}></label>`);
        elem.textContent = `${Math.floor(second/60) ? Math.floor(second/60)+'分' : ''}${Math.floor(second) % 60}秒`;

        player.seekTo(second);
        input.parentElement.insertBefore(elem, input.nextElementSibling);
    }

    static getPlayer(parent) {
        if(this.#playerMap.has(parent)) {
            return this.#playerMap.get(parent);
        } else {
            return null; // NOTE nullに変更
        }
    };

    /** @param {[HTMLElement, Player]} param0  */
    static set setPlayer([key, value]) { // ...分割代入？
        // この関数(setter)はセットするだけ
        this.#playerMap.set(key, value);
    }

    /** @returns {Pr | false} */
    static getVideo(id) {
        // あった方が便利そうだし...
        for (const player of this.#playerMap.values()) {
            if (player.videos.has(id)) return player.videos.get(id);
        }
        return false; // 見つからなかったらこれ
    }

    static removeVideo(id) {
        const video = this.getVideo(id);
        if(!video) {
            console.warn(`${id}という動画は見つかりませんでした`);
            return;
        }

        this.getPlayer(video.getIframe().parentElement.parentElement).deleteVideo(id);
        console.debug(`${id}が削除されました`);
    }

    static removePlayer(elem) {
        const player = this.getPlayer(elem);
        if(!player) {
            console.warn('プレーヤーが見つかりませんでした');
            return;
        }

        player.clearVideo(); // 動画を削除
        this.#playerMap.delete(elem); // playerMapから削除

        // あとはどうしようもないからdeleteで変数ごと消してね
    }
};

function onYouTubeIframeAPIReady() {
    console.log('YouTubeAPI: どうもー');
    YouTubeAPI.isAPILoaded = true;
}
