/** Line icons used across the site (24×24, stroke = currentColor). */
const I = ({ children, ...p }) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>{children}</svg>;
export const BackIcon = p => <I {...p}><path d="M19 12H5m6-6-6 6 6 6" /></I>;
export const BagIcon = p => <I {...p}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></I>;
export const HeartIcon = p => <I {...p}><path d="M12 20s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20Z" /></I>;
export const SearchIcon = p => <I {...p}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.6-4.6" /></I>;
export const CloseIcon = p => <I {...p}><path d="M6 6l12 12M18 6 6 18" /></I>;
export const LockIcon = p => <I {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></I>;
export const TruckIcon = p => <I {...p}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.6" /><circle cx="17" cy="17.5" r="1.6" /></I>;
export const SwapIcon = p => <I {...p}><path d="M4 9h13l-3-3M20 15H7l3 3" /></I>;
export const GiftIcon = p => <I {...p}><rect x="4" y="10" width="16" height="10" rx="1" /><path d="M3 7h18v3H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0" /></I>;
export const DropIcon = p => <I {...p}><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" /></I>;
