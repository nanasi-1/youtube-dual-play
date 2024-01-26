!async function () {
    await YouTubeAPI.APILoad();
    const sampleSection = document.getElementById('sample');
    const player = new Player(sampleSection);

    player.addVideo('rBHK8Z8cwmQ'); // Todo 動画IDを変更
}();