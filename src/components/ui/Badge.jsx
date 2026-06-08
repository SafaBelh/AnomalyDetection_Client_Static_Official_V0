export const Badge = ({ children, type = "mute" }) => (
  <span className={`badge badge-${type}`}>{children}</span>
);
