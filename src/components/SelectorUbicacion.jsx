
import React from 'react';

const SelectorUbicacion = ({
  tipoSeleccionado,
  setTipoSeleccionado,
  numeroSeleccionado,
  setNumeroSeleccionado,
  subdivisionSeleccionada,
  setSubdivisionSeleccionada,
  numeros,
  subdivisiones,
  handleConfirmarUbicacion
}) => (
  <form onSubmit={handleConfirmarUbicacion}>
    <div className="tipo-selector">
      <h4>Tipo de ubicación:</h4>
      {["M", "G", "P"].map((tipo) => (
        <button
          key={tipo}
          className={`tipo-btn ${tipoSeleccionado === tipo ? "activo" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setTipoSeleccionado(tipo);
            setNumeroSeleccionado('');
            setSubdivisionSeleccionada('');
          }}
        >
          {tipo === "M" ? "🧱 Módulo" : tipo === "G" ? "🛒 Góndola" : "📌 Puntera"}
        </button>
      ))}
    </div>

    {tipoSeleccionado && (
      <div className="numero-selector">
        <h4>Número:</h4>
        {[...new Set(numeros)].map((n) => (
          <button
            key={n}
            className={`numero-btn ${numeroSeleccionado === n ? "activo" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setNumeroSeleccionado(n);
              setSubdivisionSeleccionada('');
            }}
          >
            {n}
          </button>
        ))}
      </div>
    )}

    {numeroSeleccionado && (
      <div className="subdivision-selector">
        <h4>Estante / Fila de Ranurado:</h4>
        {[...new Set(subdivisiones)].map((s) => (
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
    )}

    {subdivisionSeleccionada && (
      <button type="submit" className="btn-confirmar-ubicacion">
        ✅ Confirmar Ubicación
      </button>
    )}
  </form>
);

export default SelectorUbicacion;
