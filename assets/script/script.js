import listSong from './database.js'
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRepeat: false,
    isRandom: false,
    render: function() {
        const htmls = listSong.map((song, index) => {
            return `
                <div class="song ${(index === this.currentIndex ? 'active' : '')}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')"></div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        });
        playList.innerHTML = htmls.join('');
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return listSong[this.currentIndex];
            }
        })
    },
    handleEvents: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Handle CD spin and stop
        const cdThumbAnimate = cdThumb.animate([
            {
                transform: 'rotate(360deg)'
            }
        ], {
            duration: 12000,
            iterations: Infinity
        });
        cdThumbAnimate.pause();

        // Handle zoom in / zoom out CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = (newCdWidth > 0 ? newCdWidth + 'px' : 0);
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Handle when click
        playBtn.onclick = function() {
            _this.isPlaying ? audio.pause() : audio.play();
        }

        // The song is playing
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // The song isn't playing
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // When the song tempo changes
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        } 

        // Handle when increase tempo
        progress.onchange = function(event) {
            const seekTime = audio.duration / 100 * event.target.value;
            audio.currentTime = seekTime;
        }

        // Handle when the song ended 
        audio.onended = function() {
            _this.isRepeat ? audio.play() : nextBtn.click();
        }

        // Handle turn on / turn off repeat the song
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // When previous the song
        prevBtn.onclick = function() {
            _this.isRandom ? _this.randomSong() : _this.prevSong();
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // When next the song
        nextBtn.onclick = function() {
            _this.isRandom ? _this.randomSong() : _this.nextSong();
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Handle turn on / turn off random the song
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // Handle when click playlist
        playList.onclick = function(event) {
            const songNode = event.target.closest('.song:not(.active)');
            const optionNode = event.target.closest('.option');
            if (songNode || optionNode) {

                // Handle when click song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }

                // Handle when click option
                if (optionNode) {
                    alert('Nếu tôi nhìn xa hơn những người khác, thì đó là vì tôi đứng trên vai những người khổng lồ ❤❤❤')
                }
            }
        }
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;
    },
    scrollToActiveSong() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
        }, 300);
    },
    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = listSong.length - 1;
        }
        this.loadCurrentSong();
    },
    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex == listSong.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    randomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * listSong.length);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function() {
        // Define properties of object
        this.defineProperties();

        // Listen / handle events (DOM events)
        this.handleEvents();

        // Load the first song info into the UI when running the app
        this.loadCurrentSong();

        // Render playlist
        this.render();
    }
}

app.start();
