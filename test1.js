const constraints = {
    audio: true,
    video: false
};

navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 4096;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function update() {
        requestAnimationFrame(update);

        analyser.getByteFrequencyData(dataArray);
        const volume = getRMS(dataArray);

        const db = 20 * Math.log10(volume / 0.00002);
        document.getElementById("db-value").textContent = db.toFixed(2) + " dB";
        document.getElementById("volume-value").textContent = volume.toFixed(2);
    }

    update();
});

function getRMS(dataArray) {
    let rms = 0;
    for (let i = 0; i < dataArray.length; i++) {
        rms += dataArray[i] ** 2;
    }
    rms /= dataArray.length;
    rms = Math.sqrt(rms);
    return rms;
}
