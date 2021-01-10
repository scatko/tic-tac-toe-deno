import { add } from './src/fun.ts'

console.log('privetik ', add(1, 2))

const appDiv = document.getElementById('app')!

const field = document.createElement('div')
field.className = 'field'
appDiv.appendChild(field)

const cellElements: HTMLDivElement[] = []

const gameState = {
  move: 0,
  over: false,
  fields: [0, 0, 0, 0, 0, 0, 0, 0, 0],
}

const lines: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],

  [0, 4, 8],
  [2, 4, 6],

  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
]

function onCellClick(id: number) {
  if (gameState.over || gameState.fields[id])
    return

  const player = (gameState.move % 2) + 1
  gameState.fields[id] = player

  cellElements[id].innerText = player === 1 ? 'x' : 'o'
  cellElements[id].style.color = player === 1 ? 'blue' : 'red'

  gameState.move++

  const winLine = lines.findIndex(line => {
    const a = gameState.fields[line[0]]
    const b = gameState.fields[line[1]]
    const c = gameState.fields[line[2]]
    if (a === b && a === c)
      return a
  })

  if (winLine !== -1) {
    gameState.over = true
    lines[winLine].forEach(l => {
      cellElements[l].style.fontSize = '90px'
      cellElements[l].style.paddingBottom = '20px'
    })
  }
}

for (let y = 0; y < 3; y++) {
  const row = document.createElement('div')
  row.className = 'row'
  field.appendChild(row)
  for (let x = 0; x < 3; x++) {
    const cell = document.createElement('div')
    cell.className = 'cell'
    row.appendChild(cell)
    cell.onclick = () => onCellClick(x + y * 3)
    cellElements.push(cell)
  }
}
