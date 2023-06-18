const video = document.getElementById('webcam')
const enablewebcamButton = document.getElementById('enablewebcam')
const liveview = document.getElementById('liveview')
const liveViewDescription = document.getElementById('liveviewdescription')

enablewebcamButton.classList.add('opacity05')

let model = undefined
cocoSsd.load().then((loadedModel) => {
  model = loadedModel
  enablewebcamButton.classList.remove('opacity05')
})

function getUserDeviceSupported() {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  )
}

if (getUserDeviceSupported()) {
  enablewebcamButton.addEventListener('click', enablewebcam)
} else {
  console.warn('getUserMedia() not supported')
}

function enablewebcam() {
  if (!model) { return }
  const constrains = {
    video: true
  }

  navigator.mediaDevices.getUserMedia(constrains).then((stream) => {
    enablewebcamButton.classList.add('invisible')
    if (stream == null) { return }
    video.srcObject = stream
    video.addEventListener('loadeddata', predict)
  })
}

const children = []
function predict() {

  model.detect(video).then((predictions) => {

    for (let i = 0; i < children.length; i++) {
      liveViewDescription.removeChild(children[i])
    }
    children.splice(0)

    for (let n = 0; n < predictions.length; n++) {
      const prediction = predictions[n]
      const confidence = Math.round(parseFloat(prediction.score) * 100)

      if (confidence > 70) {
        const objClass = prediction.class
        const p = document.createElement('p')
        const label = `${objClass} - confidence ${confidence}%`
        p.innerText = label

        liveViewDescription.appendChild(p)
        children.push(p)
      }
    }

    window.requestAnimationFrame(predict)
  })
}