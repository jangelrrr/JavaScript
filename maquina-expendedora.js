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

function añadirCambio (cambio, user, pass) {
	if (user == 'user' && pass == 'pass') {
		cambio.forEach((value, key) => {cambio.set(key, 10)})
	} else {
		console.log('Usuario o contraseña incorrectos')
	}
}

function verCambio (cambio, user, pass) {
	if (user == 'user' && pass == 'pass') {
		cambio.forEach ((value, key) => {console.log(`Monedas de ${key} centimos hay ${value} monedas`))
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

function verCambio (cambio, user, pass) {
	if (user == 'user' && pass == 'pass') {
		for (let [key, value] of productos) {
			
		}
	} else {
		console.log('Usuario o contraseña incorrectos')
	}	
}