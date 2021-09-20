import XLSX from 'xlsx';
import { asignacionGRASP } from "./AsignacionGrasp.js";

const NUM_MAX_ITERACIONES = 1000;
const ALFA_MAX = 0.3;
const ALFA_MIN = 0.25;

const calbracionAlfa = (numMaxIteraciones) => {

    const soluciones = [];

    for (let alfa = ALFA_MIN; alfa <= ALFA_MAX; alfa = alfa + 0.001 ) {
        const solucion = asignacionGRASP(numMaxIteraciones, alfa);
        soluciones.push({alfa: alfa, valor: solucion.valor});
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(soluciones);
    XLSX.utils.book_append_sheet(wb, ws, "Resultados");

    const filename = "ResultadosAsignaciónGRASP.xlsx";
    const wb_opts = {bookType: 'xlsx', type: 'binary'};   // workbook options
    XLSX.writeFile(wb, filename, wb_opts); 
}

calbracionAlfa(NUM_MAX_ITERACIONES);