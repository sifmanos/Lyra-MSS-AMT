document.addEventListener('DOMContentLoaded', () => {

    function initializeMidiWrapper(wrapperId) {
        const midiWrapper = document.getElementById(wrapperId);
        const midiPlayer = midiWrapper.querySelector('midi-player');
        const playButton = midiWrapper.querySelector('.play-button');
        const stopButton = midiWrapper.querySelector('.stop-button');
        const muteWavButton = midiWrapper.querySelector('.mute-button');
        const volumeSlider = midiWrapper.querySelector('.volume-slider');
        const waveformContainer = midiWrapper.querySelector('.waveform');

        let playCount = 0; // Track the number of times the play button is pressed
        const seekDelay = 100; // Initial delay
        let isPlaying = false;
        let isMuted = false; 
        let previousVolume = 1;
        let wasPlayingBeforeStop = false; 

        const wavFileSrc = waveformContainer.getAttribute('data-wav-src');

        const updateWaveformHeight = () => {
            const containerHeight = waveformContainer.offsetHeight;
            const newHeight = containerHeight - 10;
            return newHeight > 50 ? newHeight : 50;
        };

        const wavesurfer = WaveSurfer.create({
            container: waveformContainer,
            waveColor: '#d5d8dc',
            progressColor: '#f0b27a',
            cursorColor: "#000000",
            cursorWidth: 0,
            responsive: true,
            interact: false,
            backend: 'mediaelement',
            loopSelection: true,
            height: updateWaveformHeight(),
        });

        window.addEventListener('resize', () => {
            wavesurfer.drawer.setHeight(updateWaveformHeight());
        });

        wavesurfer.load(wavFileSrc);

        wavesurfer.on('ready', () => {
            console.log("WaveSurfer is ready, waveform should be visible.");
        });

        wavesurfer.on('error', (error) => {
            console.error("Error loading the waveform:", error);
        });

        wavesurfer.on('finish', () => {
            wavesurfer.seekTo(0); // Reset waveform to the beginning
            wavesurfer.play(); // Loop playback
        });

        volumeSlider.disabled = false;
        volumeSlider.value = 1; // Set volume slider to 50%

        const sliderCover = document.createElement('div');
        sliderCover.classList.add('slider-cover');
        volumeSlider.parentElement.style.position = 'relative';
        volumeSlider.parentElement.appendChild(sliderCover);

        const showSliderCover = () => {
            sliderCover.style.display = 'block';
        };

        const hideSliderCover = () => {
            sliderCover.style.display = 'none';
        };

        showSliderCover(); // Show slider cover initially

        playButton.addEventListener('click', () => {
            if (playCount === 0) {
                hideSliderCover(); // Hide slider cover only on the first play
            }
            playCount++; // Increment play count on each click

            if (isPlaying) {
                midiPlayer.stop();
                wavesurfer.pause();
                playButton.innerHTML = 'Play'; 
                playButton.classList.remove('active-playback');
                playButton.classList.add('paused-state');
                isPlaying = false;
                wasPlayingBeforeStop = true;
                showSliderCover();

            } else {
                if (!wasPlayingBeforeStop) {
                    midiPlayer.currentTime = 0;
                    wavesurfer.seekTo(0);
                }

                volumeSlider.disabled = false;

                midiPlayer.start();
                setTimeout(() => {
                    if (!isMuted) {
                        wavesurfer.play();
                    }
                }, seekDelay); // Ensure the delay is consistent with each start

                playButton.innerHTML = 'Pause'; 
                playButton.classList.add('active-playback');
                playButton.classList.remove('paused-state');
                isPlaying = true;
                wasPlayingBeforeStop = false;
            }
        });

        stopButton.addEventListener('click', () => {
            midiPlayer.currentTime = 0;
            midiPlayer.stop();
            wavesurfer.stop();
            wavesurfer.seekTo(0);

            playButton.innerHTML = 'Play'; 
            playButton.classList.remove('active-playback');
            playButton.classList.remove('paused-state');
            isPlaying = false;
            wasPlayingBeforeStop = false;

            volumeSlider.disabled = true;
            showSliderCover();

            playCount = 0; // Reset play count after stop is pressed
        });

        muteWavButton.addEventListener('click', () => {
            if (isMuted) {
                wavesurfer.setVolume(previousVolume); 
                muteWavButton.classList.remove('active'); 
                isMuted = false;
            } else {
                previousVolume = wavesurfer.getVolume(); 
                wavesurfer.setVolume(0); 
                muteWavButton.classList.add('active'); 
                isMuted = true;
            }
        });

        midiPlayer.addEventListener('timeupdate', () => {
            if (isPlaying) {
                const midiCurrentTime = midiPlayer.currentTime;
                const midiDuration = midiPlayer.duration;
                const percent = midiCurrentTime / midiDuration;
                wavesurfer.seekTo(percent);
            }
        });

        midiPlayer.addEventListener('seeked', () => {
            const midiCurrentTime = midiPlayer.currentTime;
            const midiDuration = midiPlayer.duration;
            const percent = midiCurrentTime / midiDuration;
            setTimeout(() => {
                wavesurfer.seekTo(percent);
                if (isPlaying && !isMuted) {
                    wavesurfer.play();
                }
            }, seekDelay);
        });

        midiPlayer.addEventListener('input', () => {
            if (isPlaying) {
                const midiCurrentTime = midiPlayer.currentTime;
                const midiDuration = midiPlayer.duration;
                const percent = midiCurrentTime / midiDuration;
                setTimeout(() => {
                    wavesurfer.seekTo(percent);
                    if (isPlaying && !isMuted) {
                        wavesurfer.play();
                    }
                }, seekDelay);
            }
        });

        volumeSlider.addEventListener('input', () => {
            const volume = volumeSlider.value;
            wavesurfer.setVolume(volume);

            if (isMuted) {
                muteWavButton.classList.remove('active'); 
                isMuted = false;
                previousVolume = volume;
            }
        });
    }

    const midiWrappers = document.querySelectorAll('.midi-wrapper');
    midiWrappers.forEach((wrapper) => {
        initializeMidiWrapper(wrapper.id);
    });

});
