function addSection() {
    const buttons = strToElement(`
        <div>
            <button onclick="YouTubeAPI.play(this)">再生</button>
            <button onclick="YouTubeAPI.pause(this)">停止</button>
        </div>
    `);
    document.querySelector('main').append(buttons);
}