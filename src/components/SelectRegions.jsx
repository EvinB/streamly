import React from 'react';

const SelectRegions = ({ selectedRegions, setSelectedRegions, onSave, onClose }) => {
    const availableRegions = [
        { id: 1, name: 'AD' }, { id: 2, name: 'AE' }, { id: 3, name: 'AG' },
        { id: 4, name: 'AL' }, { id: 5, name: 'AO' }, { id: 6, name: 'AR' },
        { id: 7, name: 'AT' }, { id: 8, name: 'AU' }, { id: 9, name: 'AZ' },
        { id: 10, name: 'BA' }, { id: 11, name: 'BB' }, { id: 12, name: 'BE' },
        { id: 13, name: 'BF' }, { id: 14, name: 'BG' }, { id: 15, name: 'BH' },
        { id: 16, name: 'BM' }, { id: 17, name: 'BO' }, { id: 18, name: 'BR' },
        { id: 19, name: 'BS' }, { id: 20, name: 'BY' }, { id: 21, name: 'BZ' },
        { id: 22, name: 'CA' }, { id: 23, name: 'CD' }, { id: 24, name: 'CH' },
        { id: 25, name: 'CI' }, { id: 26, name: 'CL' }, { id: 27, name: 'CM' },
        { id: 28, name: 'CO' }, { id: 29, name: 'CR' }, { id: 30, name: 'CU' },
        { id: 31, name: 'CV' }, { id: 32, name: 'CY' }, { id: 33, name: 'CZ' },
        { id: 34, name: 'DE' }, { id: 35, name: 'DK' }, { id: 36, name: 'DO' },
        { id: 37, name: 'DZ' }, { id: 38, name: 'EC' }, { id: 39, name: 'EE' },
        { id: 40, name: 'EG' }, { id: 41, name: 'ES' }, { id: 42, name: 'FI' },
        { id: 43, name: 'FJ' }, { id: 44, name: 'FR' }, { id: 45, name: 'GB' },
        { id: 46, name: 'GF' }, { id: 47, name: 'GG' }, { id: 48, name: 'GH' },
        { id: 49, name: 'GI' }, { id: 50, name: 'GQ' }, { id: 51, name: 'GR' },
        { id: 52, name: 'GT' }, { id: 53, name: 'GY' }, { id: 54, name: 'HK' },
        { id: 55, name: 'HN' }, { id: 56, name: 'HR' }, { id: 57, name: 'HU' },
        { id: 58, name: 'ID' }, { id: 59, name: 'IE' }, { id: 60, name: 'IL' },
        { id: 61, name: 'IN' }, { id: 62, name: 'IQ' }, { id: 63, name: 'IS' },
        { id: 64, name: 'IT' }, { id: 65, name: 'JM' }, { id: 66, name: 'JO' },
        { id: 67, name: 'JP' }, { id: 68, name: 'KE' }, { id: 69, name: 'KR' },
        { id: 70, name: 'KW' }, { id: 71, name: 'LB' }, { id: 72, name: 'LC' },
        { id: 73, name: 'LI' }, { id: 74, name: 'LT' }, { id: 75, name: 'LU' },
        { id: 76, name: 'LV' }, { id: 77, name: 'LY' }, { id: 78, name: 'MA' },
        { id: 79, name: 'MC' }, { id: 80, name: 'MD' }, { id: 81, name: 'ME' },
        { id: 82, name: 'MG' }, { id: 83, name: 'MK' }, { id: 84, name: 'ML' },
        { id: 85, name: 'MT' }, { id: 86, name: 'MU' }, { id: 87, name: 'MW' },
        { id: 88, name: 'MX' }, { id: 89, name: 'MY' }, { id: 90, name: 'MZ' },
        { id: 91, name: 'NE' }, { id: 92, name: 'NG' }, { id: 93, name: 'NI' },
        { id: 94, name: 'NL' }, { id: 95, name: 'NO' }, { id: 96, name: 'NZ' },
        { id: 97, name: 'OM' }, { id: 98, name: 'PA' }, { id: 99, name: 'PE' },
        { id: 100, name: 'PF' }, { id: 101, name: 'PG' }, { id: 102, name: 'PH' },
        { id: 103, name: 'PK' }, { id: 104, name: 'PL' }, { id: 105, name: 'PS' },
        { id: 106, name: 'PT' }, { id: 107, name: 'PY' }, { id: 108, name: 'QA' },
        { id: 109, name: 'RO' }, { id: 110, name: 'RS' }, { id: 111, name: 'SA' },
        { id: 112, name: 'SC' }, { id: 113, name: 'SE' }, { id: 114, name: 'SG' },
        { id: 115, name: 'SI' }, { id: 116, name: 'SK' }, { id: 117, name: 'SM' },
        { id: 118, name: 'SN' }, { id: 119, name: 'SV' }, { id: 120, name: 'TC' },
        { id: 121, name: 'TD' }, { id: 122, name: 'TH' }, { id: 123, name: 'TN' },
        { id: 124, name: 'TR' }, { id: 125, name: 'TT' }, { id: 126, name: 'TW' },
        { id: 127, name: 'TZ' }, { id: 128, name: 'UA' }, { id: 129, name: 'UG' },
        { id: 130, name: 'US' }, { id: 131, name: 'UY' }, { id: 132, name: 'VA' },
        { id: 133, name: 'VE' }, { id: 134, name: 'YE' }, { id: 135, name: 'ZA' },
        { id: 136, name: 'ZM' }, { id: 137, name: 'ZW' }
      ];
      

  const handleRegionChange = (regionId) => {
    setSelectedRegions((prev) =>
      prev.includes(regionId)
        ? prev.filter((id) => id !== regionId) // Deselect
        : [...prev, regionId] // Select
    );
  };

  return (
    <div style={styles.modal}>
      <h3>Select Regions</h3>
      <div style={styles.gridContainer}>
        {availableRegions.map((region) => (
          <label key={region.id} style={styles.label}>
            <input
              type="checkbox"
              checked={selectedRegions.includes(region.id)}
              onChange={() => handleRegionChange(region.id)}
            />
            {region.name}
          </label>
        ))}
      </div>
      <div style={{ marginTop: '20px' }}>
        <button style={styles.button} onClick={onSave}>
          Save
        </button>
        <button style={styles.button} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

const styles = {
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#333',
    color: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
    width: '500px',
    maxHeight: '80vh',
    overflowY: 'auto',
    zIndex: 1000,
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '10px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  button: {
    margin: '5px',
    padding: '10px',
    backgroundColor: '#555',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default SelectRegions;
