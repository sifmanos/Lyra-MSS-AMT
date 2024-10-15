document.addEventListener('DOMContentLoaded', () => {
    const playerContainers = document.querySelectorAll('.audio-player-instance');

    playerContainers.forEach((container, index) => {
        const audio1 = container.getAttribute('data-audio1');
        const audio2 = container.getAttribute('data-audio2');
        const title = container.getAttribute('data-title');
        const subtitle = container.getAttribute('data-subtitle');

        // Set up the HTML structure for each player instance
        container.innerHTML = `
            <div class="audio-player">
                <div class="top-controls">
                    <div class="title">${title}</div>
                    <div class="playback-controls">
                        <button id="play${index}" class="play-button">Play</button>
                        <button id="stop${index}" class="stop-button">Stop</button>
                        <div class="time-display">
                            <span id="current-time${index}">0:00</span> / <span id="duration${index}">0:00</span>
                        </div>
                    </div>
                </div>
                <div class="waveform-container">
                    <div class="button-group">
                        <div class="audio-name">Lyra</div>
                        <button id="solo1-${index}" class="small-button solo">Solo</button>
                        <button id="mute1-${index}" class="small-button mute">Mute</button>
                    </div>
                    <div id="waveform1-${index}" class="waveform"></div>
                </div>
                <div class="waveform-container">
                    <div class="button-group">
                        <div class="audio-name">Lute</div>
                        <button id="solo2-${index}" class="small-button solo">Solo</button>
                        <button id="mute2-${index}" class="small-button mute">Mute</button>
                    </div>
                    <div id="waveform2-${index}" class="waveform"></div>
                </div>
            </div>
        `;

        if (subtitle) {
            container.innerHTML += `<div class="small_subtitle">${subtitle}</div>`; // Add the subtitle only if it's defined
        }
        // Initialize WaveSurfer instances
        const wavesurfer1 = WaveSurfer.create({
            container: `#waveform1-${index}`,
            waveColor: '#d5d8dc',
            progressColor: '#f0b27a',
            cursorColor: "#000000",
            cursorWidth: 0,
            height: 200,
            responsive: true,
            interact: true,
            backend: 'mediaelement',
            loopSelection: true
        });

        const wavesurfer2 = WaveSurfer.create({
            container: `#waveform2-${index}`,
            waveColor: '#d5d8dc',
            progressColor: '#85c1e9',
            cursorColor: "#000000",
            cursorWidth: 0,
            height: 200,
            responsive: true,
            interact: true,
            backend: 'mediaelement',
            loopSelection: true
        });

        // Looping functionality
        wavesurfer1.on('finish', () => wavesurfer1.play());
        wavesurfer2.on('finish', () => wavesurfer2.play());
        // Load the audio files
        wavesurfer1.load(audio1);
        wavesurfer2.load(audio2);

        // Synchronize waveform2's timestamp with waveform1 during interaction
        wavesurfer1.on('interaction', (newTime) => {
            wavesurfer2.setTime(newTime);
        });

        wavesurfer2.on('interaction', (newTime) => {
            wavesurfer1.setTime(newTime);
        });

        // Playback controls
        const playButton = document.getElementById(`play${index}`);
        const stopButton = document.getElementById(`stop${index}`);
        const currentTimeDisplay = document.getElementById(`current-time${index}`);
        const durationDisplay = document.getElementById(`duration${index}`);

        playButton.addEventListener('click', () => {
            if (wavesurfer1.isPlaying()) {
                wavesurfer1.pause();
                wavesurfer2.pause();
                playButton.textContent = "Play";  // Change button text to Play
                playButton.style.color = "black";  // Revert to default color
                playButton.classList.remove('active');  // Remove active class
            } else {
                wavesurfer1.play();
                wavesurfer2.play();
                playButton.textContent = "Pause";  // Change button text to Pause
                playButton.style.color = "#000";  // Active color
                playButton.classList.add('active');  // Add active class to change background/border
            }
        });
        
        stopButton.addEventListener('click', () => {
            wavesurfer1.stop();
            wavesurfer2.stop();
        
            // Reset Play button text, color, and remove active class
            playButton.textContent = "Play";  
            playButton.style.color = "black";
            playButton.classList.remove('active');  // Reset the active state of Play
        
            // Add active-playback class to Stop button for temporary visual feedback (change color)
            stopButton.classList.add('active-playback');
            setTimeout(() => {
                stopButton.classList.remove('active-playback');
            }, 200);
        });
        
        // Solo and mute buttons
        const solo1Button = document.getElementById(`solo1-${index}`);
        const mute1Button = document.getElementById(`mute1-${index}`);
        const solo2Button = document.getElementById(`solo2-${index}`);
        const mute2Button = document.getElementById(`mute2-${index}`);

        let isSolo1 = false;
        let isSolo2 = false;
        let isMute1 = false;
        let isMute2 = false;

        function setActiveButton(activeButton) {
            [playButton, pauseButton, stopButton].forEach(button => {
                button.classList.remove('active-playback');
                button.style.color = 'black';
            });

            if (activeButton) {
                activeButton.classList.add('active-playback');
                activeButton.style.color = '#f7a7a7';
            }
        }

        function updateVolumes() {
            if (isMute1) {
                wavesurfer1.setVolume(0);
                wavesurfer1.setOptions({ progressColor: '#d5d8dc' });
            } else if (isSolo1 || (!isSolo1 && !isSolo2)) {
                wavesurfer1.setVolume(1);
                wavesurfer1.setOptions({ progressColor: '#f0b27a' });
            } else {
                wavesurfer1.setVolume(0);
                wavesurfer1.setOptions({ progressColor: '#d5d8dc' });
            }

            if (isMute2) {
                wavesurfer2.setVolume(0);
                wavesurfer2.setOptions({ progressColor: '#d5d8dc' });
            } else if (isSolo2 || (!isSolo1 && !isSolo2)) {
                wavesurfer2.setVolume(1);
                wavesurfer2.setOptions({ progressColor: '#85c1e9' });
            } else {
                wavesurfer2.setVolume(0);
                wavesurfer2.setOptions({ progressColor: '#d5d8dc' });
            }
        }

        function toggleButtonState(button, stateVariable) {
            if (stateVariable) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }

        solo1Button.addEventListener('click', () => {
            isSolo1 = !isSolo1;
            toggleButtonState(solo1Button, isSolo1);
            updateVolumes();
        });

        solo2Button.addEventListener('click', () => {
            isSolo2 = !isSolo2;
            toggleButtonState(solo2Button, isSolo2);
            updateVolumes();
        });

        mute1Button.addEventListener('click', () => {
            isMute1 = !isMute1;
            toggleButtonState(mute1Button, isMute1);
            updateVolumes();
        });

        mute2Button.addEventListener('click', () => {
            isMute2 = !isMute2;
            toggleButtonState(mute2Button, isMute2);
            updateVolumes();
        });

        wavesurfer1.on('ready', () => {
            durationDisplay.textContent = formatTime(wavesurfer1.getDuration());
        });

        wavesurfer1.on('audioprocess', () => {
            currentTimeDisplay.textContent = formatTime(wavesurfer1.getCurrentTime());
        });

        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
        }
    });
});
