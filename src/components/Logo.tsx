// Логотип FOX из плаката (прайс_1.pdf), разрезан на 4 слоя-маски одного размера:
// машина (белая), лис (рыжий), «FOX» (рыжий), «CAR SERVICE» (белый).
// Цвет слоёв задаётся CSS-токенами, поэтому слои можно анимировать по отдельности.
// Исходник слоёв: public/brand/logo-*.png (1832x892).
export default function Logo({ className = "", shine = false }: { className?: string; shine?: boolean }) {
  return (
    <span className={`lg ${className}`} role="img" aria-label="FOX Car Service">
      <i className="lg-car" />
      <i className="lg-fox" />
      <i className="lg-word" />
      <i className="lg-sub" />
      {shine && <i className="lg-shine" />}
    </span>
  );
}
