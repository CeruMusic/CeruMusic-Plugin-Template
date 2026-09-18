let count = 0
document.getElementById('counter').addEventListener('click', (event) => {
  event.currentTarget.textContent = '计数 ' + ++count
})
