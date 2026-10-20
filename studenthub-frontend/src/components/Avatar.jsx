const initials = (name) =>
  (name || "Student").trim().charAt(0).toUpperCase();

function Avatar({ name, image, size = "sm" }) {
  if (image) {
    return (
      <img
        className={`avatar avatar-${size} avatar-img`}
        src={image}
        alt={name || "Student"}
      />
    );
  }

  return <span className={`avatar avatar-${size}`}>{initials(name)}</span>;
}

export { initials, Avatar };