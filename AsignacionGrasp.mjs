import { productosRecepcionadosData, ubicacionesData } from "./AsignacionGraspData.mjs";

const numMaxIteraciones = 10;
const alfa = 0.3;
// const array = [];

const AsignacionGRASP = (numMaxIteraciones, alfa) => {
    let mejorSolucion = {
        candidatos: [],
        costo: 0,
    };
    for (let i = 0; i < numMaxIteraciones; i++) {
        let solucion = construccion(alfa);
        solucion = busquedaLocal(solucion);
        // console.log(solucion);
        if (solucion.costo > mejorSolucion.costo)
            mejorSolucion = solucion; 
        console.log('Iteración: ', i + 1);
        console.log('costo: ', mejorSolucion.costo);
    }
    return mejorSolucion;
}

const construccion = (alfa) => {
    const solucion = {
        candidatos: [],
        costo: 0
    };
    let productosRecepcionados = productosRecepcionadosData;
    let ubicaciones = ubicacionesData;
    productosRecepcionados.forEach(() => {
        const RCL = obtenerRCL(productosRecepcionados, ubicaciones, alfa);
        // console.log(RCL.length);  
        // considerar salida tras repeticiones (10)
        const candidatoAleatorio = RCL[Math.floor(Math.random() * RCL.length)];
        solucion.candidatos.push(candidatoAleatorio);
        // console.log(candidatoAleatorio);
        solucion.costo += obtenerCosto(candidatoAleatorio);
        productosRecepcionados = actualizarProductosRecepcionados(productosRecepcionados, candidatoAleatorio);
        ubicaciones = actualizarUbicaciones(ubicaciones, candidatoAleatorio);
    });
    return solucion;
}

const obtenerRCL = (productosRecepcionados, ubicaciones, alfa) => {
    const paresPosibles = obtenerParesPosibles(productosRecepcionados, ubicaciones);
    // console.log(paresPosibles.length);
    const costoPeorCandidato = obtenerCostoPeorCandidato(paresPosibles);
    const costoMejorCandidato = obtenerCostoMejorCandidato(paresPosibles);
    const RCL = [];
    const minRCL = costoMejorCandidato - alfa*(costoMejorCandidato - costoPeorCandidato);
    paresPosibles.forEach(productoUbicacion => {
        const costo = obtenerCosto(productoUbicacion);
        if (costo >= minRCL) RCL.push(productoUbicacion);
    })
    return RCL;
}

const obtenerParesPosibles = (productosRecepcionados, ubicaciones) => {
    const paresPosibles = [];
    productosRecepcionados.forEach(producto => {
        ubicaciones.forEach(ubicacion => {
            if (producto.clasificacion === ubicacion.clasificacion ){
                const productoUbicacion = {producto: {...producto}, ubicacion: {...ubicacion}};
                paresPosibles.push(productoUbicacion);
            }
        });    
    });
    return paresPosibles;
}

const convertirRotacion = (producto) => {
    switch (producto.rotacion) {
        case 'A':
            return 1000;
        case 'B':
            return 250;
        case 'C':
            return 100;
        default:
            return 0;
    }
}

const obtenerDistancia = (ubicacion) => {
    const { posicionEnMetros } = ubicacion;
    return posicionEnMetros.fila + posicionEnMetros.columna + posicionEnMetros.nivel * 10;
}

const obtenerCostoPeorCandidato = (paresPosibles) => {
    return Math.min(...paresPosibles.map(productoUbicacion => obtenerCosto(productoUbicacion)));
}

const obtenerCostoMejorCandidato = (paresPosibles) => {
    return Math.max(...paresPosibles.map(productoUbicacion => obtenerCosto(productoUbicacion)));
}

const obtenerCosto = (productoUbicacion) => {
    return convertirRotacion(productoUbicacion.producto) / obtenerDistancia(productoUbicacion.ubicacion);
}


const actualizarProductosRecepcionados = (productosRecepcionados, productoUbicacion) => {
    return productosRecepcionados.filter((producto) => producto.codigo !== productoUbicacion.producto.codigo);
}

const actualizarUbicaciones = (ubicaciones, productoUbicacion) => {
    return ubicaciones.filter((ubicacion) => ubicacion.id !== productoUbicacion.ubicacion.id);;
}

const busquedaLocal = (solucion) => {
    const numMaxIteraciones = 1000;
    let mejorSolucion = {...solucion};
    for (let i = 0; i < numMaxIteraciones; i++) {
        // console.log("Solución global: ", mejorSolucion.costo);
        let solucionLocal = alternarCandidatos(mejorSolucion);
        // console.log("Solución local obtenida: ", solucionLocal.costo);
        if (solucion.costo > mejorSolucion.costo) {
            mejorSolucion = solucionLocal;
            console.log("Nueva solución local: ", mejorSolucion.costo);
        }
    }
    return solucion;
}

const alternarCandidatos = (solucion) => {
    const solucionAlterada = {candidatos: [...solucion.candidatos], costo: 0};
    const par1 = solucionAlterada.candidatos[Math.floor(Math.random() * solucionAlterada.candidatos.length)];
    const par2 = obtenerParPosible(par1, solucionAlterada.candidatos);
    if (par2) {
        solucionAlterada.costo = calcularCostoCandidatos(solucionAlterada.candidatos);
        let temp = par1.producto;
        par1.producto = par2.producto;
        par2.producto = temp;
    }
    return solucionAlterada;
}

const obtenerParPosible = (par1, candidatos) => {
    const paresPosibles = candidatos.filter((ubicacionProducto) => ubicacionProducto.producto.clasificacion === par1.producto.clasificacion);
    if (!paresPosibles.length) return null;
    return paresPosibles[Math.floor(Math.random() * paresPosibles.length)];
}

const calcularCostoCandidatos = (solucion) => {
    // console.log(solucion[0]);
    return solucion.reduce((prev, curr) => prev + obtenerCosto(curr), 0);
}

const solucionGRASP = AsignacionGRASP(numMaxIteraciones, alfa);

// console.log('Solución num: ', solucionGRASP.candidatos.length);
// console.log('Solución: ');
// console.log(solucionGRASP);

// const array = [1,2,3,4,5,6,7];
// while (array){
    
// }
// array.forEach((element, index, arr) => {
//     console.log(element);
//     console.log(array.filter(element => element === 4));
// });

