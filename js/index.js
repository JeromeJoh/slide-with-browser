console.clear()

// preset data
const colorArray = ["#683A5E", "#262626", "#426F42", "#8B814C", "#36648B", "#36648B"]
const dur = 0.5
let offsets = []
let oldSlide = 0
let activeSlide = 0
let iw = window.innerWidth

// initialize page
const init = () => {
  render()
  bindEvents()
}

function render() {
  // set slides background colors and create the nav dots
  const fragment = document.createDocumentFragment()

  for (let i = 0; i < slides.length; i++) {
    TweenMax.set(slides[i], {
      backgroundColor: colorArray[i]
    })
    const dot = document.createElement("div")
    dot.className = "indicator"
    dot.index = i
    dot.addEventListener("click", slideAnim)
    fragment.appendChild(dot)
  }

  dots.appendChild(fragment)

  // get elements positioned
  TweenMax.set(".indicator-group, .title-group", {
    xPercent: -50
  })
  TweenMax.set(".arrow", {
    yPercent: -50
  })
  TweenMax.set(".title", {
    y: 30
  })
}

function bindEvents() {
  window.addEventListener("resize", sizeIt)
  window.addEventListener("wheel", slideAnim)
  document.querySelector("#previous").addEventListener("click", slideAnim)
  document.querySelector("#next").addEventListener("click", slideAnim)

  // const indicators = document.querySelectorAll(".indicator")
  // for (let i = 0; i < indicators.length; i++) {
  //   indicators[i].addEventListener("click", slideAnim)
  // }
}

// resize the page
function sizeIt() {
  offsets = []
  iw = window.innerWidth
  TweenMax.set(".content", {
    width: slides.length * iw
  })
  TweenMax.set(slides, {
    width: iw
  })
  for (let i = 0; i < slides.length; i++) {
    offsets.push(-slides[i].offsetLeft)
  }
  TweenMax.set(container, {
    x: offsets[activeSlide]
  })
  dragMe[0].vars.snap = offsets
}

// DOM Elements
const slides = document.querySelectorAll("section")
const container = document.querySelector(".content")
const dots = document.querySelector(".indicator-group")

init()


// lower screen animation with nav dots and rotating titles
const dotAnim = new TimelineMax({
  paused: true
})

dotAnim.staggerTo(".indicator", 1, {
  scale: 2.1,
  rotation: 0.1,
  yoyo: true,
  repeat: 1,
  ease: Linear.easeNone
}, 1)

dotAnim.to(".title", slides.length + 1, {
  y: -(slides.length * 30),
  rotation: 0.01,
  ease: Linear.easeNone
}, 0)

dotAnim.time(1)

// make the whole thing draggable
const dragMe = Draggable.create(container, {
  type: "x",
  edgeResistance: 1,
  snap: offsets,
  throwProps: true,
  bounds: "main",
  onDrag: tweenDot,
  onThrowUpdate: tweenDot,
  onDragEnd: slideAnim,
  allowNativeTouchScrolling: false,
  zIndexBoost: false
})

dragMe[0].id = "dragger"
sizeIt()

// main action check which of the 4 types of interaction called the function
function slideAnim(e) {
  oldSlide = activeSlide
  // dragging the panels
  if (this.id === "dragger") {
    activeSlide = offsets.indexOf(this.endX)
  } else {
    if (TweenMax.isTweening(container)) {
      return
    }
    // up/down arrow clicks
    if (this.id === "previous" || this.id === "next") {
      activeSlide = this.id === "next" ? (activeSlide += 1) : (activeSlide -= 1)
      // click on a dot
    } else if (this.className === "indicator") {
      activeSlide = this.index
      // scrollwheel
    } else {
      activeSlide = e.deltaY > 0 ? (activeSlide += 1) : (activeSlide -= 1)
    }
  }
  // make sure we're not past the end or beginning slide
  activeSlide = activeSlide < 0 ? 0 : activeSlide
  activeSlide = activeSlide > slides.length - 1 ? slides.length - 1 : activeSlide
  if (oldSlide === activeSlide) {
    return
  }
  // if we're dragging we don't animate the container
  if (this.id != "dragger") {
    TweenMax.to(container, dur, {
      x: offsets[activeSlide],
      onUpdate: tweenDot
    })
  }
}

// update dot animation when dragger moves
function tweenDot() {
  TweenMax.set(dotAnim, {
    time: Math.abs(container._gsTransform.x / iw) + 1
  })
}