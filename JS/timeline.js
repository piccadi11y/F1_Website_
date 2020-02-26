class Timeline {
	constructor (wrapper, data) {
		this.data = data
		this.wrapperId = wrapper
		this.wrapper = document.getElementById(wrapper)
		
		this.slidesWidth = 0
		this.docWidth = window.innerWidth //document.getElementsByTagName('main')[0].getBoundingClientRect().width
		
		this.timelineInner = null
		this.nodes = null
		
		//my variation
		this.baseScrollSpeed = 200
		this.speedMultiplier = 0.0
		this.scrollMin = 0
		this.scrollMax = null
		this.currentOffset = null
	}
	
	getData (index=null) {
		if (index) return this.data[index]
		return this.data
	}
	
	init () {
		if (this.data) {
			this.injectHTML()
			
			this.timelineInner = document.querySelector(`#${this.wrapperId} .timeline`)
			this.nodes = document.querySelectorAll(`#${this.wrapperId} .tl-node`)
			
			this.slidesWidth = 300 * (this.nodes.length + 1) + 100
			this.scrollMax = this.slidesWidth - this.docWidth
			this.currentOffset = -1 * (this.slidesWidth * .5) + (this.docWidth * .5)
			this.timelineInner.style.transform = `translate3d(${this.currentOffset}px,0,0)`
			
			//console.log(this.slidesWidth)
			this.wrapper.addEventListener('mousemove', this.mouseListen.bind(this))
			window.addEventListener('resize', this.windowSizeChange.bind(this))
			
			for (let i of document.getElementsByClassName('line')) i.style.backgroundColor = TAB_COLOURS.Seasons.main
		}
	}
	
	injectHTML () {
		let timelineWrapper = this.wrapper
		timelineWrapper.classList.add('timeline-wrapper')
		
		let timeline = document.createElement('div')
		timeline.classList.add('timeline')
		timelineWrapper.appendChild(timeline)
		
		let line = document.createElement('div')
		line.classList.add('line')
		timelineWrapper.appendChild(line)
		
		let nodeWrapper = document.createElement('div')
		nodeWrapper.classList.add('node-wrapper')
		timeline.appendChild(nodeWrapper)
		
		for (let i in this.data) {
			let tlNode = document.createElement('div')
			tlNode.classList.add('tl-node')
			
			tlNode.innerHTML = `
				<a class="pButton" id="pb_${i}" onclick="TIMELINE_ON_BUTTON_CLICK(this.id)"><p class="year">${this.data[i]}</p></a>`
			
			nodeWrapper.appendChild(tlNode)
		}
	}
	
	draw () {
		if (this.speedMultiplier < -.1 || this.speedMultiplier > .1) {
			this.currentOffset += this.baseScrollSpeed * this.speedMultiplier
			//clamp the offset
			if (this.currentOffset < this.scrollMin) this.currentOffset = this.scrollMin
			if (this.currentOffset > this.scrollMax) this.currentOffset = this.scrollMax
			
			this.timelineInner.style.transform = `translate3d(${-this.currentOffset}px,0,0)`
		}
	}
	
	windowSizeChange () {
		this.docWidth = window.innerWidth
		this.scrollMax = this.slidesWidth - this.docWidth
	}
	
	mouseListen (e) {
		let mouseX = e.pageX,
			percentMouse = (mouseX * 100 / this.docWidth) - 50
		this.speedMultiplier = percentMouse / 100
		this.draw()			
	}
}

function TIMELINE_ON_BUTTON_CLICK(id) {
	//season_selectYear(timeline.getData(id.charAt(id.length - 1)))
	season_selectYear(timeline.getData(id.slice(3)))
}