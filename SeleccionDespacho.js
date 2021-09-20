import moment from "moment";
import { pedidosData } from "./Datos/PedidosData.js";
import { inventarioData } from "./Datos/InventarioData.js";
import { ubicacionesData } from "./Datos/UbicacionesData.js";

const FACTOR_DISTANCIA_VERTICAL = 10;

const seleccionDespacho = () => {
    const solucion = [];
    let ubicacionesConUnidades = ubicacionesData.filter(ubicacion => ubicacion.idUnidadManipulacion);
    ubicacionesConUnidades = ubicacionesConUnidades.map(ubicacion => obtenerUbicacionUnidad(ubicacion))
    let pedidos = pedidosData;
    pedidos.forEach(pedido => {
        const solucionPedido = [];
        pedido.productos.map((producto) => {
            const unidadesDisponibles = ubicacionesConUnidades.filter(ubicacionUnidad => ubicacionUnidad.unidadManipulacion.codigoProducto === producto.codigo);
            const unidadSeleccionada = aplicarCriterios(unidadesDisponibles);
            solucionPedido.push(unidadSeleccionada);
        })
        solucion.push({id: pedido.id, unidadesSeleccionadas: solucionPedido})
    })
    return solucion;
}

const obtenerUbicacionUnidad = (ubicacion) => {
    const unidadManipulacion = inventarioData.find(unidadManipulacion => ubicacion.idUnidadManipulacion === unidadManipulacion.id );
    return {unidadManipulacion: unidadManipulacion, ubicacion: ubicacion}
}

const aplicarCriterios = (unidadesDisponibles) => {
    return unidadesDisponibles.reduce( (prev, curr) => {
        if (fechaExpiracion(prev).getTime() !== fechaExpiracion(curr).getTime()) {
            return fechaExpiracion(prev) < fechaExpiracion(curr) ? prev : curr;
        }
        if (fechaIngreso(prev).getTime() !== fechaIngreso(curr).getTime())
            return fechaIngreso(prev) < fechaIngreso(curr) ? prev : curr;
        return distancia(prev) < distancia(curr) ? prev : curr;
    });
}

const fechaExpiracion = (unidadUbicacion) => {
    return moment(unidadUbicacion.unidadManipulacion.fechaExpiracion, "DD-MM-YYYY").toDate();
}

const fechaIngreso = (unidadUbicacion) => {
    return moment(unidadUbicacion.unidadManipulacion.fechaIngreso, "DD-MM-YYYY").toDate();
}

const distancia = (unidadUbicacion) => {
    const { ubicacion } = unidadUbicacion;
    const { posicionEnMetros } = ubicacion;
    return posicionEnMetros.fila + posicionEnMetros.columna + posicionEnMetros.nivel * FACTOR_DISTANCIA_VERTICAL;
}

console.log("Solución selección despacho:", seleccionDespacho());