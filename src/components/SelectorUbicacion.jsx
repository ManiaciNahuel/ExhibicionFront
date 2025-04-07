import React from 'react';
import '../styles/SelectorUbicacion.css'; // lo armamos luego

const SelectorUbicacion = ({
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
          {[
            { label: 'Puntera 1', value: 'P1' },
            { label: 'Puntera 2', value: 'P2' },
            { label: 'Lado 1', value: 'L1' },
            { label: 'Lado 2', value: 'L2' },
          ].map(({ label, value }) => (
            <button
              key={value}
              className={`division-btn ${division === value[0] && numeroDivision === parseInt(value[1]) ? 'activo' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                if (typeof setDivision === 'function') {
                  setDivision(value[0]); // 'P' o 'L'
                } else {
                  console.error("setDivision no está definida como función");
                }
                setNumeroDivision(parseInt(value[1])); // 1 o 2
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
        <button type="submit" className="btn-confirmar-ubicacion">
          ✅ Confirmar Ubicación
        </button>
      )}
    </form>
  );
}

export default SelectorUbicacion;
