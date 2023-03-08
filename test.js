navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function (stream) {
        // AudioContextを作成する
        var audioContext = new AudioContext();

        // MediaStreamSourceNodeを作成する
        var sourceNode = audioContext.createMediaStreamSource(stream);

        // AnalyserNodeを作成する
        var analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 4096; // FFTサイズを設定する

        // グラフを描画するためのCanvasを作成する
        var canvas = document.querySelector('canvas');
        canvas.width = 400;
        canvas.height = 200;
        var canvasContext = canvas.getContext('2d');

        // AnalyserNodeを接続する
        sourceNode.connect(analyserNode);

        // 描画を開始する
        draw();

        function draw() {
            // 時間領域の波形データを取得する
            var bufferLength = analyserNode.fftSize;
            var dataArray = new Uint8Array(bufferLength);
            analyserNode.getByteTimeDomainData(dataArray);

            // 波形を描画する
            canvasContext.fillStyle = 'rgb(200, 200, 200)';
            canvasContext.fillRect(0, 0, canvas.width, canvas.height);
            canvasContext.lineWidth = 2;
            canvasContext.strokeStyle = 'rgb(0, 0, 0)';
            canvasContext.beginPath();
            var sliceWidth = canvas.width * 1.0 / bufferLength;
            var x = 0;
            for (var i = 0; i < bufferLength; i++) {
                var v = dataArray[i] / 128.0;
                var y = v * canvas.height / 2;
                if (i === 0) {
                    canvasContext.moveTo(x, y);
                } else {
                    canvasContext.lineTo(x, y);
                }
                x += sliceWidth;
            }
            canvasContext.lineTo(canvas.width, canvas.height / 2);
            canvasContext.stroke();

            // デシベル値を計算する
            var rms = 0;
            for (var i = 0; i < bufferLength; i++) {
                rms += dataArray[i] * dataArray[i];
            }
            rms /= bufferLength;
            rms = Math.sqrt(rms);
            var db = 20 * Math.log10(rms);

            // デシベル値を表示する
            var dbElement = document.getElementById('db');
            dbElement.innerHTML = db.toFixed(2) + ' dB';

            // 次の描画を予約する
            requestAnimationFrame(draw);
        }
    })
    .catch(function (err) {
        // エラーを処理する
        console.error(err);
    });