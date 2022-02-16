        const $ = document.querySelector.bind(document)
		const $$ = document.querySelectorAll.bind(document)

		const PLAYER_STORAGE_KEY = 'player'

		const heading = $('.header h2')
		const cdThumb = $('.cd-thumb')
		const audio = $('#audio'); audio.volume = 0.1
		const cd = $('.cd')
		const playBtn = $('.btn-toggle-play')
		const progress = $('#progress')
		const prevBtn = $('.btn-prev')
		const nextBtn = $('.btn-next')
		const randomBtn = $('.btn-random')
		const repeatBtn = $('.btn-repeat')
		const playlist = $('.playlist')

		const app = {
			isPlaying: false,
			currentIndex: 0,
			isRandom: false,
			isRepeat: false,
			config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
			setConfig: function(key, value) {
				this.config[key] = value
				localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
			},
			songs: [
				{
					name: 'Có chàng trai viết lên cây',
					singer: 'Phan Mạnh Quỳnh',
					path: 'assets/music/CoChangTraiVietLenCayDJTranomRemix-PhanManhQuynh-6199143.mp3',
					image: 'assets/img/Co_Chang_Trai_Viet_Len_Cay.jpg'
				},
				{
					name: 'Cô Thắm không về',
					singer: 'PhatHo Jokes BiiThien',
					path: 'assets/music/CoThamKhongVeDinhLongRemix-PhatHoJokesBiiThien-6085150.mp3',
					image: 'assets/img/Co_Tham_Khong_Ve.jpg'
				},
				{
					name: 'Hạ còn vương nắng',
					singer: 'DATKAA x KIDO x Prod. QT',
					path: 'assets/music/haConVuongNang.mp3',
					image: 'assets/img/haConVuongNang.jpg'
				},
				{
					name: 'Ai đưa em về',
					singer: 'TiaHaiChau LeThienHieu',
					path: 'assets/music/AiDuaEmVeSuperbrothersRemix-TiaHaiChauLeThienHieu-6058422.mp3',
					image: 'assets/img/yeuTuDauMaRa.jpg'
				},
				{
					name: 'Lạ Lùng',
					singer: 'TiaHaiChau LeThienHieu',
					path: 'assets/music/LaLung.mp3',
					image: 'assets/img/yeuTuDauMaRa.jpg'
				},
				{
					name: 'Xe đạp',
					singer: 'Charles HuynhCM1X',
					path: 'assets/music/XeDapLofiCover-CharlesHuynhCM1X-6273316.mp3',
					image: 'assets/img/yeuTuDauMaRa.jpg'
				},
				{
					name: 'Yêu từ đâu mà ra',
					singer: 'Vũ',
					path: 'assets/music/YeuTuDauMaRa.mp3',
					image: 'assets/img/yeuTuDauMaRa.jpg'
				},
				{
					name: "Save me",
					singer: 'Anyone',
					path: 'assets/music/SaveMe.mp3',
					image: 'assets/img/SaveMe.jpg'
				},
				{
					name: 'You don\'t know me',
					singer: 'Brodie Barclay',
					path: 'assets/music/YouDontKnowMe-OfenbachBrodieBarclay-4396475.mp3',
					image: 'assets/img/youDontKnowMe.jpg'
				}
			],
			songsRepeat: [

			],
			defineProperties: function() {
				Object.defineProperty(this, 'currentSong', {
					get: function() {
						return this.songs[this.currentIndex]
					}
				})
			},
			render: function() {
				const htmls = this.songs.map((song, index) => {
					return `
						<div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
							<div class="thumb" style="background-image: url('${song.image}');"></div>
							<div class="body">
								<h3 class="title">${song.name}</h3>
								<span class="author">${song.singer}</span>
							</div>
							<div class="option">
								<i class="fas fa-ellipsis-h"></i>
							</div>
						</div>
					`
				})
				$('.playlist').innerHTML = htmls.join('')
			},
			handleEvents: function() {
				const cdWidth = cd.offsetWidth
				const _this = this;

				//Xử lý phóng to thu nhỏ cd
				document.onscroll = function() {
					const scrollTop = window.scrollY || document.documentElement.scrollTop
					const newWidth = cdWidth - scrollTop
					cd.style.width = newWidth < 0 ? 0 : newWidth + 'px'
                    cd.style.opacity = newWidth / cdWidth
				}

				//Xử lý khi nhấn play
				playBtn.onclick = function() {
					if (_this.isPlaying) {
						audio.pause()
					} else {
						audio.play()
					}
				}

				//Xu ly quay cd
				const cdThumbAnimate = cdThumb.animate([
					{transform: 'rotate(360deg)'}
				], {
					duration: 20000,
					iterations: Infinity
				})
				cdThumbAnimate.pause()

				//Khi bài hát bắt đầu được phát
				audio.onplay = function() {
					_this.isPlaying = true
					playBtn.classList.add('playing')
					cdThumbAnimate.play()
				}

				//Khi bai hat duoc bam dung
				audio.onpause = function() {
					_this.isPlaying = false
					playBtn.classList.remove('playing')
					cdThumbAnimate.pause()
				}

				//khi chay bai hat
				audio.ontimeupdate = function() {
					if (audio.duration) {
						const progressPercentage = Math.floor(audio.currentTime / audio.duration * 100)
						progress.value = progressPercentage
					}
				}
				
				//Xu ly tua audio
				progress.onchange = function(e) {
					const seekTime = e.target.value / 100 * audio.duration
					audio.currentTime = seekTime
				}

				//Xu ly khi bam next
				nextBtn.onclick = function() {
					if (_this.isRandom) {
						_this.randomSong()
					} else {
						_this.nextSong()
					}
					_this.render()
					audio.play()
					_this.scrollToActiveSong()
				}

				//Xu ly khi bam prev
				prevBtn.onclick = function() {
					if (_this.isRandom) {
						_this.randomSong()
					} else {
						_this.prevSong()
					}
					_this.render()
					audio.play()
					_this.scrollToActiveSong()
				}

				//Xu ly khi bam random
				randomBtn.onclick = function() {
					_this.isRandom = !_this.isRandom
					_this.setConfig('isRandom', _this.isRandom)
					randomBtn.classList.toggle('active', _this.isRandom)
				}

				//Xu ly khi bam repeat
				repeatBtn.onclick = function() {
					_this.isRepeat = !_this.isRepeat
					_this.setConfig('isRepeat', _this.isRepeat)
					repeatBtn.classList.toggle('active', _this.isRepeat)
				}

				//Xu ly khi end bai hat
				audio.onended = function() {
					if (_this.isRepeat) {
						audio.play()
					} else {
						nextBtn.click()
					}
				}

				//Xu ly khi click vao bai hat
				playlist.onclick = function(e) {
					if (e.target.closest('.song:not(.active)') || e.target.closest('.option')) {
						if (e.target.closest('.song:not(.active)')) {
							_this.currentIndex = Number(e.target.closest('.song:not(.active)').getAttribute('data-index')) 
							_this.loadCurrentSong()
							_this.render()
							audio.play()
						}
						if (e.target.closest('.option')) {

						}
					}
				}
			
			},
			loadConfig: function() {
				this.isRandom = this.config.isRandom
				this.isRepeat = this.config.isRepeat
				randomBtn.classList.toggle('active', this.isRandom)
				repeatBtn.classList.toggle('active', this.isRepeat)				
			},
			loadCurrentSong: function() {
				heading.textContent = this.currentSong.name
				cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
				audio.src = this.currentSong.path
			},
			nextSong: function() {
				this.oldIndexActive = this.currentIndex
				this.currentIndex++
				if (this.currentIndex > this.songs.length - 1) {
					this.currentIndex = 0
				}
				this.loadCurrentSong()
			},
			prevSong: function() {
				this.oldIndexActive = this.currentIndex
				this.currentIndex--
				if (this.currentIndex < 0) {
					this.currentIndex = this.songs.length - 1
				}
				this.loadCurrentSong()
			},
			randomSong: function() {
				var newIndex
				this.songsRepeat.push(this.currentIndex)
				if (this.songsRepeat.length == this.songs.length) {
					this.songsRepeat.length = 0
				}
				do {
					newIndex = Math.floor(Math.random() * this.songs.length)
				} while (this.songsRepeat.includes(newIndex))
				this.currentIndex = newIndex
				this.loadCurrentSong()
			},
			scrollToActiveSong: function() {
				setTimeout(function() {
					$('.song.active').scrollIntoView({
						behavior: 'smooth',
						block: 'end',
					})
				}, 200)
			},
			start: function() {
				//Load config
				this.loadConfig()

				//Định nghĩa thuộc tính cho object
				this.defineProperties()

				//render va Lắng nghe và xử lý sự kiện
				this.handleEvents()

				//Load bài đầu vào giao diện
				this.loadCurrentSong()

				//render ra man hinh
				this.render()

			}
      	}

      	app.start()


