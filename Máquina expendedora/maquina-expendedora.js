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

function addChange (user, pass, ...coins) {
	if (user == 'user' && pass == 'pass') {
		for (let coin of coins) {
			change.set(coin, change.get(coin) + 1)
		}
	} else {
		console.log('Usuario o contraseña incorrectos')
	}
}

function seeChange (user, pass) {
	if (user == 'user' && pass == 'pass') {
		change.forEach ((value, key) => {console.log(`coins de ${key} centimos hay ${value} coins`)})
		console.log(`La caja es de ${cash}`)
	} else {
		console.log('Usuario o contraseña incorrectos')
	}	
}

function addStock (user, pass, ...items) {
	if (user == 'user' && pass == 'pass') {
		for (let item of items) {
			products.get(item)[1] += 1
		}
	} else {
		console.log('Usuario o contraseña incorrectos')
	}
}

function seeStock (user, pass) {
	if (user == 'user' && pass == 'pass') {
		for (let [key, value] of products) {
			console.log(`${products.get(key)[0]} hay ${products.get(key)[1]}`)
		}
	} else {
		console.log('Usuario o contraseña incorrectos')
	}	
}

const warnings = []

function seeWarnings(user, pass) {
	if (user == 'user' && pass == 'pass') {
		for (let warning of warnings) {
			console.log(warning)
		}
	} else {
		console.log('Usuario o contraseña incorrectos')
	}
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

buy(3, [200, 200, 50])
buy(3, [200, 200])
buy(1, [200, 200])
buy(5, [200, 50, 100])
seeChange('user', 'pass')
seeStock('user', 'pass')
seeWarnings('user', 'pass')