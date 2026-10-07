import { IconSearch, IconX } from '../Icons';

export default function SearchBar({ value, onChange, placeholder = 'Cari...' }) {
  // Ensure placeholder does not contain duplicate emoji search icon
  const cleanPlaceholder = placeholder.replace(/^[🔍\s]+/, '');

  return (
    <div className="search-bar-wrap">
      <span className="search-icon-inside" aria-hidden="true">
        <IconSearch size={18} color="var(--muted)" />
      </span>
      <input
        type="text"
        className="search-input-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={cleanPlaceholder}
      />
      {value && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={() => onChange('')}
          aria-label="Hapus pencarian"
        >
          <IconX size={12} color="var(--muted)" />
        </button>
      )}
    </div>
  );
}
