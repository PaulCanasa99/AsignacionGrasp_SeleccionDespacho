import { productosRecepcionadosData } from "./Datos/ProductosRecepcionadosData.js";
import { productosData } from "./Datos/ProductosData.js";
import { ubicacionesData} from "./Datos/UbicacionesData.js";

const NUM_MAX_ITERACIONES = 1000;
const NUM_MAX_ITERACIONES_LOCAL = 100;
const ALFA = 0.3;
const ROTACION_A = 1;
const ROTACION_B = 0.5;
const ROTACION_C = 0.1;
const FACTOR_DISTANCIA_VERTICAL = 10;
const MAX_DISTANCIA = Math.max(...ubicacionesData.map(ubicacion => ubicacion.posicionEnMetros.fila + ubicacion.posicionEnMetros.columna + ubicacion.posicionEnMetros.nivel*FACTOR_DISTANCIA_VERTICAL));
const MIN_DISTANCIA = Math.min(...ubicacionesData.map(ubicacion => ubicacion.posicionEnMetros.fila + ubicacion.posicionEnMetros.columna + ubicacion.posicionEnMetros.nivel*FACTOR_DISTANCIA_VERTICAL));

export const asignacionGRASP = (numMaxIteraciones, alfa) => {
    let mejorSolucion = {
        candidatos: [],
        valor: 0,
    };
    for (let i = 0; i < numMaxIteraciones; i++) {
        let solucion = construccion(alfa);
        solucion = busquedaLocal(solucion);
        if (solucion.valor > mejorSolucion.valor) {
            mejorSolucion = solucion;
            console.log('Iteración: ', i + 1);
            console.log('Valor: ', mejorSolucion.valor);
        }
    }
    return mejorSolucion;
}

const construccion = (alfa) => {
    const solucion = {
        candidatos: [],
        valor: 0
    };
    let productosRecepcionados = productosRecepcionadosData.map(productoRecepcionado => productosData.find((producto) => producto.codigo === productoRecepcionado.codigo ));
    let ubicaciones = ubicacionesData.filter(ubicacion => !ubicacion.idUnidadManipulacion);
    productosRecepcionados.forEach(() => {
        const RCL = obtenerRCL(productosRecepcionados, ubicaciones, alfa);
        const candidatoAleatorio = RCL[Math.floor(Math.random() * RCL.length)];
        solucion.candidatos.push(candidatoAleatorio);
        solucion.valor += obtenerValor(candidatoAleatorio);
        ubicaciones = actualizarUbicaciones(ubicaciones, candidatoAleatorio);
    });
    return solucion;
}

const obtenerRCL = (productosRecepcionados, ubicaciones, alfa) => {
    const paresPosibles = obtenerParesPosibles(productosRecepcionados, ubicaciones);
    const valorPeorCandidato = obtenerValorPeorCandidato(paresPosibles);
    const valorMejorCandidato = obtenerValorMejorCandidato(paresPosibles);
    const RCL = [];
    const minRCL = valorMejorCandidato - alfa*(valorMejorCandidato - valorPeorCandidato);
    paresPosibles.forEach(productoUbicacion => {
        const valor = obtenerValor(productoUbicacion);
        if (valor >= minRCL) RCL.push(productoUbicacion);
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
            return ROTACION_A;
        case 'B':
            return ROTACION_B;
        case 'C':
            return ROTACION_C;
        default:
            return 0;
    }
}

const obtenerDistancia = (ubicacion) => {
    const { posicionEnMetros } = ubicacion;
    return posicionEnMetros.fila + posicionEnMetros.columna + posicionEnMetros.nivel * FACTOR_DISTANCIA_VERTICAL;
}

const obtenerValorPeorCandidato = (paresPosibles) => {
    return Math.min(...paresPosibles.map(productoUbicacion => obtenerValor(productoUbicacion)));
}

const obtenerValorMejorCandidato = (paresPosibles) => {
    return Math.max(...paresPosibles.map(productoUbicacion => obtenerValor(productoUbicacion)));
}

const obtenerValor = (productoUbicacion) => {
    return convertirRotacion(productoUbicacion.producto) / normalizar(obtenerDistancia(productoUbicacion.ubicacion), MIN_DISTANCIA, MAX_DISTANCIA);
}

const actualizarUbicaciones = (ubicaciones, productoUbicacion) => {
    return ubicaciones.filter((ubicacion) => ubicacion.id !== productoUbicacion.ubicacion.id);;
}

const busquedaLocal = (solucion) => {
    const numMaxIteraciones = NUM_MAX_ITERACIONES_LOCAL;
    let mejorSolucion = {...solucion};
    for (let i = 0; i < numMaxIteraciones; i++) {
        let solucionLocal = alternarCandidatos(mejorSolucion);
        if (solucion.valor > mejorSolucion.valor) {
            mejorSolucion = solucionLocal;
            console.log("Nueva solución local: ", mejorSolucion.valor);
        }
    }
    return solucion;
}

const alternarCandidatos = (solucion) => {
    const solucionAlterada = {candidatos: [...solucion.candidatos], valor: 0};
    const par1 = solucionAlterada.candidatos[Math.floor(Math.random() * solucionAlterada.candidatos.length)];
    const par2 = obtenerParPosible(par1, solucionAlterada.candidatos);
    if (par2) {
        solucionAlterada.valor = calcularValorCandidatos(solucionAlterada.candidatos);
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

const calcularValorCandidatos = (solucion) => {
    return solucion.reduce((prev, curr) => prev + obtenerValor(curr), 0);
}

const normalizar = (val, min, max) => {
    const delta = max - min;
    return (val - min) / delta
}

asignacionGRASP(NUM_MAX_ITERACIONES, ALFA);