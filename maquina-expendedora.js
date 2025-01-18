 /* Enunciado: Simula el funcionamiento de una máquina expendedora creando una operación
 * que reciba dinero (array de monedas) y un número que indique la selección del producto.
 * - El programa retornará el nombre del producto y un array con el dinero de vuelta (con el menor
 *   número de monedas).
 * - Si el dinero es insuficiente o el número de producto no existe, deberá indicarse con un mensaje
 *   y retornar todas las monedas.
 * - Si no hay dinero de vuelta, el array se retornará vacío.
 * - Para que resulte más simple, trabajaremos en céntimos con monedas de 5, 10, 50, 100 y 200.
 * - Debemos controlar que las monedas enviadas estén dentro de las soportadas.
 */
class machine {
    
    productos = new Map ([
		[1, ['Coca-cola', 200]],
		[2, ['Aquarius', 200]],
		[3, ['Agua', 150]],
		[4, ['Bocadillo', 400]],
		[5, ['Gominolas', 120]],
		[6, ['Red Bull', 400]]
	])
	
	stockProductos = new Map ([
	    [1, 10],
	    [2, 10],
	    [3, 10],
	    [4, 10],
	    [5, 10],
	    [6, 10]
	])

	dineroCambio = new Map ([
		[5, 10],
		[10, 10],
		[20, 10],
		[50, 10],
		[100, 10],
		[200, 10]
	])
	
	constructor (numProducto, dinero) {
		this.numProducto = numProducto,
		this.dinero = dinero
	}
	
	mostrarNombre() {
		if (this.productos.has(this.numProducto)) {
			return this.productos.get(this.numProducto)[0]
		} else {
			return 'Este producto no existe'
		}
	}
	
	
	cambiar() {
		let entradaDinero = 0
		let monedasCambio
		const monedas = [200, 100, 50, 20, 10, 5]
		//comprobamos monedas 
		for (let monedaEntrada of this.dinero) {
		    if (monedas.includes(monedaEntrada)) {
		        entradaDinero += monedaEntrada
		    } else {
		        return ['Moneda no soportada', this.dinero]
		    }
		    //añadimos monedas al cambio
		    monedasCambio = this.dineroCambio.get(monedaEntrada)
		    this.dineroCambio.set(monedaEntrada, monedasCambio++)
		}
		//eliminamos stock
		let stockActual = this.stockProductos.get(this.numProducto)
		this.stockProductos.set(this.numProducto, stockActual-1)
		let precioVuelta = entradaDinero - this.productos.get(this.numProducto)[1]
		//dar el cambio
		let vuelta = []
		let indiceVuelta
        let indiceCalculo = 0
        let calculo
        while (indiceCalculo < monedas.length || precioVuelta == 0) {
            calculo = precioVuelta / monedas[indiceCalculo]
            if (calculo < 1) {
                indiceCalculo++
            } else {
                calculo = parseInt(calculo)
                precioVuelta -= monedas[indiceCalculo] * calculo
                indiceVuelta = 0
                while (indiceVuelta < calculo) {
                    vuelta.push(monedas[indiceCalculo])
                    indiceVuelta++
                }
                indiceCalculo++
            }
        }
        return vuelta
	}
	
}

/*const pur = new machine(3, [5, 1, 200, 100])
console.log(pur.dineroCambio)
*/
//a mayores: poner límite al cambio
//poner stock de productos 


function comprar (numero, money) {
 	const compra = new machine(numero, money)
 	console.log(compra.mostrarNombre())
 	console.log(compra.cambiar())
 	console.log(compra.dineroCambio)
 	console.log(compra.stockProductos)
 }
 
comprar(3, [5, 50, 200])
comprar(2, [5, 200, 200])

