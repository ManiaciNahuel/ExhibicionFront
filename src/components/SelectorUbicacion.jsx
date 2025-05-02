import React from 'react';
import '../styles/SelectorUbicacion.css'; // lo armamos luego

const SelectorUbicacion = ({
  moviendo,
  ubicacionesPermitidas,
  tipoSeleccionado,
  setTipoSeleccionado,
  numeroSeleccionado,
  setNumeroSeleccionado,
  division,
  setDivision,
  numeroDivision,
  setNumeroDivision,
  subdivisionSeleccionada,
  setSubdivisionSeleccionada,
  numeros,
  subdivisiones,
  handleConfirmarUbicacion
}) => {
  if (typeof setDivision !== 'function') {
    console.error("❌ ERROR: setDivision no es una función. Valor recibido:", setDivision);
  }
  console.log("🚀 ubicacionesPermitidas:", ubicacionesPermitidas);
  const divisionesDisponibles = tipoSeleccionado === 'G' && numeroSeleccionado
    ? ubicacionesPermitidas
      .filter(u =>
        u.tipo === 'G' &&
        u.numeroUbicacion === parseInt(numeroSeleccionado)
      )
      .map(u => ({
        value: `${u.division}${u.numeroDivision}`,
        label: `${u.division === 'P' ? 'Puntera' : 'Lado'} ${u.numeroDivision}`,
        division: u.division,
        numeroDivision: u.numeroDivision
      }))
      .filter((item, index, self) =>
        index === self.findIndex(i => i.value === item.value)
      )
    : [];

  return (


    <form onSubmit={handleConfirmarUbicacion}>
      <div className="tipo-selector">
        <h4>Tipo de ubicación:</h4>
        {["M", "G"].map((tipo) => (
          <button
            key={tipo}
            className={`tipo-btn ${tipoSeleccionado === tipo ? "activo" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setTipoSeleccionado(tipo);
              setNumeroSeleccionado('');
              setDivision('');
              setNumeroDivision('');
              setSubdivisionSeleccionada('');
            }}
          >
            {tipo === "M" ? "🧱 Módulo" : "🛒 Góndola"}
          </button>
        ))}
      </div>

      {tipoSeleccionado && (
        <div className="numero-selector">
          <h4>Número:</h4>
          {numeros.map((n) => (
            <button
              key={n}
              className={`numero-btn ${numeroSeleccionado === n ? "activo" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setNumeroSeleccionado(n);
                setDivision('');
                setNumeroDivision('');
                setSubdivisionSeleccionada('');
              }}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {tipoSeleccionado === 'G' && numeroSeleccionado && (
        <div className="division-selector">
          <h4>División de Góndola:</h4>
          {divisionesDisponibles.map(({ label, value, division: div, numeroDivision: numDiv }) => (
            <button
              key={value}
              className={`division-btn ${division === div && numeroDivision === numDiv ? 'activo' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setDivision(div);
                setNumeroDivision(numDiv);
                setSubdivisionSeleccionada('');
              }}
            >
              {label}
            </button>
          ))}

        </div>
      )}


      {(tipoSeleccionado === 'M' && numeroSeleccionado) ||
        (tipoSeleccionado === 'G' && numeroSeleccionado && division && numeroDivision) ? (
        <div className="subdivision-selector">
          <h4>Estante / Fila de Ranurado:</h4>
          {subdivisiones.map((s) => (
            <button
              key={s}
              className={`subdivision-btn ${subdivisionSeleccionada === s ? "activo" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setSubdivisionSeleccionada(s);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}

      {subdivisionSeleccionada && (
        <button
          type="submit"
          className="btn-confirmar-ubicacion"
          disabled={moviendo}
        >
          {moviendo ? '⏳ Moviendo...' : '✅ Confirmar Ubicación'}
        </button>

      )}
    </form>
  );
}

export default SelectorUbicacion;
