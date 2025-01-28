let productos = new Map ([
	[1, ['Coca-cola', 10, 200]],
	[2, ['Aquarius', 10, 200]],
	[3, ['Agua', 10, 150]],
	[4, ['Bocadillo', 10, 400]],
	[5, ['Gominolas', 10, 120]],
	[6, ['Red Bull', 10, 400]]
])
	
let cambio = new Map ([
	[5, 10],
	[10, 10],
	[20, 10],
	[50, 10],
	[100, 10],
	[200, 10]
])

let caja = 0

function añadirCambio (cambio, user, pass) {
	if (user == 'user' && pass == 'pass') {
		cambio.forEach((value, key) => {cambio.set(key, 10)})
	} else {
		console.log('Usuario o contraseña incorrectos')
	}
}

function verCambio (cambio, user, pass) {
	if (user == 'user' && pass == 'pass') {
		cambio.forEach ((value, key) => {console.log(`Monedas de ${key} centimos hay ${value} monedas`)})
		console.log(`La caja es de ${caja}`)
	} else {
		console.log('Usuario o contraseña incorrectos')
	}	
}

function añadirStock (productos, user, pass) {
	if (user == 'user' && pass == 'pass') {
		for (let [key, value] of productos) {
			productos.set(key, [value[0], 10, value[2]])
		}
	} else {
		console.log('Usuario o contraseña incorrectos')
	}
}

function verStock (cambio, user, pass) {
	if (user == 'user' && pass == 'pass') {
		for (let [key, value] of productos) {
			console.log(`${productos.get(key)[0]} hay ${productos.get(key)[1]}`)
		}
	} else {
		console.log('Usuario o contraseña incorrectos')
	}	
}

function comprar(numProducto, monedas) {
    const tipoMonedas = [200, 100, 50, 20, 10, 5]
    let dineroEntrada = 0
    //introducimos las monedas si son soportadas
    for (let i of monedas) {
        if (!tipoMonedas.includes(i)) {
            console.log('Moneda no soportada')
            return monedas
        } else {
            dineroEntrada += i
            if (cambio.get(i) >= 10) {
                caja += i
            } else {
                cambio.set(i, cambio.get(i) + 1)
            }
        }
    }
    //restamos las monedas menos el coste
    let costeVuelta = dineroEntrada - productos.get(numProducto)[2]
	//restamos el producto al stock
	if (productos.get(numProducto)[1] == 0) {
		console.log(`No hay ${productos.get(numProducto)[0]}`)
		return monedas
	} else if (productos.get(numProducto)[1] <=3) {
		console.log(`Bajo stock de ${productos.get(numProducto)[0]}`)
		productos.get(numProducto)[1] -= 1
	} else {
		productos.get(numProducto)[1] -= 1
	}
    //calculamos la vuelta
    let vuelta = []
    let cantidadMonedas
    let indice = 0
	let monedaActual
    while (costeVuelta != 0) {
		monedaActual = tipoMonedas[indice]
        cantidadMonedas = parseInt(monedaActual / costeVuelta)
        if (cantidadMonedas > 0) {
            for (let j = 0; j <= cantidadMonedas; j++) {
				if (cambio.get(monedaActual) == 0) {
					continue
				} else {
					vuelta.push(monedaActual)
					cambio.set(monedaActual, cambio.get(monedaActual) - 1)
					costeVuelta -= monedaActual
				}
				
			}
        } else {
			continue
		}
		indice++
    }
	return `Nombre del producto: ${productos.get(numProducto)[0]}\nVuelta: ${vuelta}`

}

comprar(3, [100, 200, 50])