import React, { useState, useEffect } from 'react'; // Import useEffect

function AddressForm({
  formUsage,
  onClose,
  selectedLocation,
  city,
  postalCode,
  formType,
  editAddressId,
  redirectType,
}) {
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: city || '', // Initialize city from props, or empty string
    state: '',
    zip: postalCode || '' // Initialize zip from postalCode prop, or empty string
  });

  // Add this useEffect hook to log props
  useEffect(() => {
    console.log('AddressForm Props Received:', {
      formUsage,
      onClose: typeof onClose === 'function' ? 'function' : onClose, // Log type for function
      selectedLocation,
      city,
      postalCode,
      formType,
      editAddressId,
      redirectType,
    });

    // You might also want to update formData if props change after initial mount
    // For example, if the user moves the map while the form is open
    setFormData((prevData) => ({
      ...prevData,
      city: city || '',
      zip: postalCode || '',
    }));

  }, [formUsage, onClose, selectedLocation, city, postalCode, formType, editAddressId, redirectType]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Address submitted successfully!');
    if (onClose) { // Call onClose if it exists
        onClose();
    }
  };

  return (
    // You'll likely want to style this as a modal, but for now, it's just the form
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      zIndex: 1000 // Ensure it's above other content
    }}>
      <h2>Enter Address Details</h2>
      <p>Location: Lat: {selectedLocation?.latitude}, Lng: {selectedLocation?.longitude}</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name: </label><br />
          <input type="text" name="name" value={formData.name} onChange={handleChange} />
        </div>
        <div>
          <label>Street: </label><br />
          <input type="text" name="street" value={formData.street} onChange={handleChange} />
        </div>
        <div>
          <label>City: </label><br />
          <input type="text" name="city" value={formData.city} onChange={handleChange} />
        </div>
        <div>
          <label>State: </label><br />
          <input type="text" name="state" value={formData.state} onChange={handleChange} />
        </div>
        <div>
          <label>ZIP Code: </label><br />
          <input type="text" name="zip" value={formData.zip} onChange={handleChange} />
        </div>
        <br />
        <button type="submit">Submit</button>
        <button type="button" onClick={onClose} style={{ marginLeft: '10px' }}>Cancel</button>
      </form>
    </div>
  );
}

export default AddressForm;