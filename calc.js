let entrada = ['e30', 'e40', ' ', ' ']
let f = 0 
let t = 0 
let e = 0 
for (let i of entrada) {
    if (i === " ") {
        continue
    } else if (i[0] == 'f') {
        f += Number(i.slice(1, i.length))
    } else if (i[0] == 't') {
        t += Number(i.slice(1, i.length))
    } else if (i[0] == 'e') {
        e += Number(i.slice(1, i.length))
    }
}
function redondear (importe, tipo) {
    let result = importe * tipo
    let primer = (result /10) * 10
    let restante = (result - primer) * 10
    if (restante > 75) {
        primer += 10
    } else if (restante < 50 && restante > 25) {
        primer += 5
    }
    return primer
}
let declara = t + redondear(e, 0.90)
let a = declara + f
let b = e + t + f
let factura = declara / 1.21
factura = String(factura).replace('.', ',')
let todo = `A : ${a} B: ${b} \n\n${factura}`
console.log(todo)