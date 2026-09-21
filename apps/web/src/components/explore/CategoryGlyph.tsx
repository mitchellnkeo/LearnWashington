import { categoryIconMarkup } from "@/lib/category-icons";

export function CategoryGlyph({
  icon,
  color,
  size = 18,
}: {
  icon: string;
  color: string;
  size?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="11" fill={color} />
      <g
        fill="#fffaf2"
        transform="translate(4.6 4.6) scale(0.62)"
        dangerouslySetInnerHTML={{ __html: categoryIconMarkup(icon, color) }}
      />
    </svg>
  );
}
