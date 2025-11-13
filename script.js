// Wait for DOM to load
document.addEventListener('DOMContentLoaded', async () => {
    const pianoKeys = document.querySelectorAll(".piano-keys .key");
    const volumeSlider = document.querySelector(".volume-slider input");
    const keysCheckbox = document.querySelector(".keys-checkbox input");
    
    let allKeys = [];
    let playedSequence = [];
    
    // Target sequence: G, D#, D, C, D, D#, G, D#, D, C
    const targetSequence = ['G4', 'D#4', 'D4', 'C4', 'D4', 'D#4', 'G4', 'D#4', 'D4', 'C4'];
    
    // Map keyboard keys to musical notes
    const keyNoteMap = {
        'a': 'C4',
        'w': 'C#4',
        's': 'D4',
        'e': 'D#4',
        'd': 'E4',
        'f': 'F4',
        't': 'F#4',
        'g': 'G4',
        'y': 'G#4',
        'h': 'A4',
        'u': 'A#4',
        'j': 'B4'
    };
    
    // Create a sampler with classic piano sound using real piano samples
    const piano = new Tone.Sampler({
        urls: {
            "C4": "C4.mp3",
            "D#4": "Ds4.mp3",
            "F#4": "Fs4.mp3",
            "A4": "A4.mp3",
        },
        release: 1,
        baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination();
    
    // Add reverb for richer, more realistic sound
    const reverb = new Tone.Reverb({
        decay: 1.5,
        wet: 0.2
    }).toDestination();
    
    await reverb.generate();
    piano.connect(reverb);
    
    // Set initial volume
    piano.volume.value = Tone.gainToDb(volumeSlider.value);
    
    const playTune = async (key) => {
        // Start Tone.js audio context on first interaction
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }
        
        const note = keyNoteMap[key];
        if (!note) return;
        
        // Play the note with classic piano sound
        piano.triggerAttackRelease(note, "2n");
        
        // Add note to played sequence
        playedSequence.push(note);
        
        // Keep only the last 10 notes (length of target sequence)
        if (playedSequence.length > targetSequence.length) {
            playedSequence.shift();
        }
        
        // Check if the sequence matches
        checkSequence();
        
        const clickedKey = document.querySelector(`[data-key="${key}"]`);
        if (clickedKey) {
            clickedKey.classList.add("active");
            setTimeout(() => {
                clickedKey.classList.remove("active");
            }, 150);
        }
    };
    
    const checkSequence = () => {
        if (playedSequence.length === targetSequence.length) {
            const isMatch = playedSequence.every((note, index) => note === targetSequence[index]);
            
            if (isMatch) {
                showCongratulations();
                playedSequence = []; // Reset sequence after success
            }
        }
    };
    
    const showCongratulations = () => {
        // Create congratulations overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;
        
        const message = document.createElement('div');
        message.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 3rem 4rem;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            animation: scaleIn 0.5s ease;
        `;
        message.innerHTML = `
            <h1 style="font-size: 3rem; margin: 0 0 1rem 0;">🎉 Congratulations! 🎉</h1>
            <p style="font-size: 1.5rem; margin: 0 0 2rem 0;">You played the secret sequence!</p>
            <button id="closeBtn" style="
                background: white;
                color: #667eea;
                border: none;
                padding: 1rem 2rem;
                font-size: 1.2rem;
                border-radius: 10px;
                cursor: pointer;
                font-weight: bold;
                transition: transform 0.2s;
            ">Awesome!</button>
        `;
        
        overlay.appendChild(message);
        document.body.appendChild(overlay);
        
        // Add animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scaleIn {
                from { transform: scale(0.5); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            #closeBtn:hover {
                transform: scale(1.05);
            }
        `;
        document.head.appendChild(style);
        
        // Close on button click
        document.getElementById('closeBtn').addEventListener('click', () => {
            overlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => overlay.remove(), 300);
        });
        
        // Add fadeOut animation
        style.textContent += `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
    };
    
    pianoKeys.forEach(key => {
        allKeys.push(key.dataset.key);
        // Use mousedown for immediate response when pressing
        key.addEventListener("mousedown", () => playTune(key.dataset.key));
    });
    
    const handleVolume = (e) => {
        // Convert linear slider value to decibels for more natural volume control
        const volume = parseFloat(e.target.value);
        piano.volume.value = volume > 0 ? Tone.gainToDb(volume) : -Infinity;
    };
    
    const showHideKeys = () => {
        pianoKeys.forEach(key => key.classList.toggle("hide"));
    };
    
    const pressedKey = (e) => {
        if (allKeys.includes(e.key)) {
            playTune(e.key);
        }
    };
    
    keysCheckbox.addEventListener("click", showHideKeys);
    volumeSlider.addEventListener("input", handleVolume);
    document.addEventListener("keydown", pressedKey);
    
    console.log("🎹 Enhanced piano loaded with Tone.js!");
});