interface CourseImageProps {
  src?: string;
  alt: string;
  className?: string;
  /** Extra classes for the image itself (e.g. hover zoom). */
  imgClassName?: string;
}

/**
 * Shows the COMPLETE course image at its own proportions: full width of its
 * container, height set automatically from the image — no cropping and no
 * padding/empty space around it.
 */
export function CourseImage({ src, alt, className = "", imgClassName = "" }: CourseImageProps) {
  if (!src) return <div className={className} />;
  return (
    <div className={`overflow-hidden ${className}`}>
      <img src={src} alt={alt} className={`block w-full h-auto ${imgClassName}`} />
    </div>
  );
}
