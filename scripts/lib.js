/**
 * 文字列をHTMLElementに変換する関数
 * @param {string} html 変換する文字列
 * @param {boolean} inHTML htmlタグが含まれているか
 * @returns {HTMLElement} 変換後
 */
function strToElement(html, inHTML=false) {
    const tempEl = document.createElement(inHTML ? 'html' : 'body');
    tempEl.innerHTML = html;
    return inHTML ? tempEl : tempEl.firstElementChild;
}