import React from 'react';

export const TableSkeleton = ({ rows = 5, cols = 6 }) => {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}>
                <div className="placeholder-glow">
                  <span className="placeholder col-6 bg-secondary opacity-25"></span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}>
                  <div className="placeholder-glow">
                    <span className="placeholder col-8 bg-secondary opacity-10"></span>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="card glass-card p-4 mb-3">
      <div className="placeholder-glow">
        <h5 className="card-title placeholder col-4 bg-secondary opacity-25"></h5>
        <p className="card-text placeholder col-12 bg-secondary opacity-15"></p>
        <p className="card-text placeholder col-8 bg-secondary opacity-15"></p>
      </div>
    </div>
  );
};

export const StatsSkeleton = () => {
  return (
    <div className="row g-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="col-md-3">
          <div className="card glass-card p-3">
            <div className="placeholder-glow d-flex flex-column gap-2">
              <span className="placeholder col-5 bg-secondary opacity-25"></span>
              <span className="placeholder col-3 bg-secondary opacity-50" style={{ height: '30px' }}></span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
