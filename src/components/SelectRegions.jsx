import React, { useState } from 'react';

const SelectRegions = ({ selectedRegions, setSelectedRegions, onClose }) => {
  // Full list of regions
  const availableRegions = [
    'AD', 'AE', 'AG', 'AL', 'AO', 'AR', 'AT', 'AU', 'AZ', 'BA', 'BB', 'BE', 'BF',
    'BG', 'BH', 'BM', 'BO', 'BR', 'BS', 'BY', 'BZ', 'CA', 'CD', 'CH', 'CI', 'CL',
    'CM', 'CO', 'CR', 'CU', 'CV', 'CY', 'CZ', 'DE', 'DK', 'DO', 'DZ', 'EC', 'EE',
    'EG', 'ES', 'FI', 'FJ', 'FR', 'GB', 'GF', 'GG', 'GH', 'GI', 'GQ', 'GR', 'GT',
    'GY', 'HK', 'HN', 'HR', 'HU', 'ID', 'IE', 'IL', 'IN', 'IQ', 'IS', 'IT', 'JM',
    'JO', 'JP', 'KE', 'KR', 'KW', 'LB', 'LC', 'LI', 'LT', 'LU', 'LV', 'LY', 'MA',
    'MC', 'MD', 'ME', 'MG', 'MK', 'ML', 'MT', 'MU', 'MW', 'MX', 'MY', 'MZ', 'NE',
    'NG', 'NI', 'NL', 'NO', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL',
    'PS', 'PT', 'PY', 'QA', 'RO', 'RS', 'SA', 'SC', 'SE', 'SG', 'SI', 'SK', 'SM',
    'SN', 'SV', 'TC', 'TD', 'TH', 'TN', 'TR', 'TT', 'TW', 'TZ', 'UA', 'UG', 'US',
    'UY', 'VA', 'VE', 'YE', 'ZA', 'ZM', 'ZW',
  ];

  // Handle checkbox changes
  const handleRegionChange = (region) => {
    setSelectedRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region) // Remove if already selected
        : [...prev, region] // Add if not selected
    );
  };

  return (
    <div style={styles.modal}>
      <h3>Select Regions</h3>
      <div style={styles.gridContainer}>
        {availableRegions.map((region) => (
          <label key={region} style={styles.label}>
            <input
              type="checkbox"
              value={region}
              checked={selectedRegions.includes(region)}
              onChange={() => handleRegionChange(region)}
            />
            {region}
          </label>
        ))}
      </div>
      <button style={styles.button} onClick={onClose}>
        Close
      </button>
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
    overflowY: 'auto', // Add scrolling if content overflows
    zIndex: 1000,
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)', // 5 columns
    gap: '10px',
    margin: '20px 0',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#ddd',
  },
  button: {
    padding: '10px',
    backgroundColor: '#555',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
  },
};

export default SelectRegions;
