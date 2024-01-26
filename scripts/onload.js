!async function () {
    await YouTubeAPI.APILoad();
    const area = AreaList.addArea(); 
    await area.addVideo('rBHK8Z8cwmQ'); // Todo 動画IDを変更
}();