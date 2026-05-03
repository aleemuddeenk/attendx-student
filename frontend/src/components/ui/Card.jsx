import React from 'react';

export default function Card({ children, title, subtitle }) {
  return (
    <div className="card">
      {title && <h2 className="card-title">{title}</h2>}
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
      {children}
    </div>
  );
}
