let mouseDown = false
function onMouseDown() {
  mouseDown = true
}
function onMouseUp() {
  mouseDown = false
}
function onMouseMove(evt) {
  if (!mouseDown) return

  const x = evt.clientX
  const y = evt.clientY
  sendMessage({ type: 'mouse', x, y });
}
window.addEventListener('mousedown', onMouseDown)
window.addEventListener('mouseup', onMouseUp)
window.addEventListener('mousemove', onMouseMove)
