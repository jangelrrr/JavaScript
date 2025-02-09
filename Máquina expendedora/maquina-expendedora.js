const rl = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
  });


function addChange() {
	const coins = [5, 10, 20, 50, 100, 200]
	rl.question('Ingresa monedas (o "0" para terminar): ', (coin) => {
		coin = Number(coin)
		if (coin === 0) {
			return seeChange()
		} else if (isNaN(coin) || !(coins.includes(coin))) {
			console.log('Moneda no soportada')
			addChange()
		} else {
			change.set(coin, change.get(coin) + 1)
			addChange()
		}
	})
}

function addStock() {
	let items = new Map([
		[1, 'Coca-cola'],
		[2, 'Aquarius'],
		[3, 'Agua'],
		[4, 'Bocadillo'],
		[5, 'Gominolas'],
		[6, 'Red Bull']
	])
	console.log(items)
	const numberItems = [...items.keys()]
	rl.question('Ingresa productos (o "0" para terminar): ', (product) => {
		product = Number(product)
		if (product === 0) {
			return seeStock()
		} else if (isNaN(product) || !(numberItems.includes(product))) {
			console.log('Número de producto no soportado')
			addStock()
		} else {
			products.get(product)[1] += 1
			addStock()
		}
	})
  }

let products = new Map ([
	[1, ['Coca-cola', 10, 220]],
	[2, ['Aquarius', 10, 240]],
	[3, ['Agua', 10, 150]],
	[4, ['Bocadillo', 10, 405]],
	[5, ['Gominolas', 10, 120]],
	[6, ['Red Bull', 10, 400]]
])
	
let change = new Map ([
	[5, 10],
	[10, 4],
	[20, 4],
	[50, 10],
	[100, 10],
	[200, 10]
])

let cash = 0


function seeChange () {
	change.forEach ((value, key) => {console.log(`coins de ${key} centimos hay ${value} coins`)})
	console.log(`La caja es de ${cash}`)
	modeAdmin()	
}


function seeStock () {
	products.forEach((value, key) => {console.log(`${products.get(key)[0]} hay ${products.get(key)[1]}`)})
	modeAdmin()	
}

const warnings = []

function seeWarnings() {
	if (!(warnings.length == 0)) {
		warnings.forEach((warning) => {console.log(warning)})
	} else {
		console.log('No hay avisos')
	}
	modeAdmin()
}

let salir = false
function modeAdmin() {
	let optionsMap = new Map([
		[0, 'Ver Cambio'],
		[1, 'Añadir Cambio'],
		[2, 'Ver Stock'],
		[3, 'Añadir Stock'],
		[4, 'Ver avisos'],
		[5, 'Salir']
	])

	function menu(user, pass) {
		if (user == 'user' && pass == 'pass') {
			console.log(optionsMap)
			function askOption() {
				rl.question('Elija una opción (0-5): ', (option) => {
					const optionNumber = parseInt(option)
                    if (optionsMap.has(optionNumber)) {
						let nextAction
						switch (optionNumber) {
							case 0: nextAction = seeChange; break;
							case 1: nextAction = addChange; break;
							case 2: nextAction = seeStock; break;
							case 3: nextAction = addStock; break;
							case 4: nextAction = seeWarnings; break;
							case 5:
								console.log('Saliendo del programa...')
								rl.close()
								salir = true
								return

						}
						if (nextAction) {
							nextAction()
						}
					} else {
						console.log('Opción inválida. Intentelo de nuevo')
						askOption()
					}
				})
			}
			askOption()
		} else {
			console.log('Usuario o contraseña incorrecto')
			modeAdmin()
		}
	}
	if (salir) {
		return
	}
	
	rl.question('Escribe el usuario: ', (user) => {
		rl.question('Escribe el password: ', (pass) => {
		  	menu(user, pass); 
		});
	});
}

function buy(numProduct, coins) {
    const typeCoins = [200, 100, 50, 20, 10, 5]
    let moneyInput = 0
    //introducimos las coins si son soportadas
    for (let coin of coins) {
        if (!typeCoins.includes(coin)) {
            console.log('Moneda no soportada')
            return coins
        } else {
            moneyInput += coin
            if (change.get(coin) >= 10) {
                cash += coin
            } else {
                change.set(coin, change.get(coin) + 1)
            }
        }
    }
    //restamos las coins menos el coste
    let costBack = moneyInput - products.get(numProduct)[2]
	//restamos el producto al stock
	if (!products.has(numProduct)) {
		console.log('Producto no disponible')
		return coins
	} else if (products.get(numProduct)[1] == 0) {
		console.log(`No hay ${products.get(numProduct)[0]}`)
		warnings.push(`No hay ${products.get(numProduct)[0]}`)
		return coins
	} else if (products.get(numProduct)[1] <=3 && !warnings.includes(`Bajo stock de ${products.get(numProduct)[0]}`)) {
		warnings.push(`Bajo stock de ${products.get(numProduct)[0]}`)
		products.get(numProduct)[1] -= 1
	} else {
		products.get(numProduct)[1] -= 1
	}
    //calculamos la back
    let back = []
    let numCoins
    let index = 0
	let coinCurrent
    while (costBack != 0) {
		coinCurrent = typeCoins[index]
        numCoins = parseInt(costBack / coinCurrent)
        if (numCoins > 0) {
            for (let j = 0; j < numCoins; j++) {
				if (change.get(coinCurrent) == 0) {
					warnings.push(`No hay cambio de ${coinCurrent}`)
					break
				} else {
					back.push(coinCurrent)
					change.set(coinCurrent, change.get(coinCurrent) - 1)
					if (change.get(coinCurrent) <= 3 && !warnings.includes(`Poco cambio de ${coinCurrent}`)) {
						warnings.push(`Poco cambio de ${coinCurrent}`)
					}
					costBack -= coinCurrent
				}
			}
        } else {
			index++
			continue
		}
		index++
    }
	return `Nombre del producto: ${products.get(numProduct)[0]}\nback: ${back}`

}

modeAdmin()

/*buy(3, [200, 200, 50])
buy(3, [200, 200])
buy(1, [200, 200])
buy(5, [200, 50, 100])
seeChange('user', 'pass')
seeStock('user', 'pass')
seeWarnings('user', 'pass')*/