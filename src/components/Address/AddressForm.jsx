import React, { useState, useContext, useCallback, useEffect, useRef } from 'react';
import axios from '../../utils/axios';
import { AuthContext } from '../../context/AuthContext';
import { LocationContext, useLocationActions } from '../../context/LocationContext';
import { useNavigate } from 'react-router-dom';

const AddressForm = ({
  onClose,
  selectedLocation,
  city = '',
  postalCode = '',
  formType = 'edit',
  editAddressId = null,
  redirectType = '',
  formUsage = 'map',
  onSaveSuccess,
  onAddressSavedForOrder,
}) => {
  const { isGuest, user } = useContext(AuthContext); // isGuest is still useful for initial pre-fill
  const { savedAddresses } = useContext(LocationContext);
  const { reload } = useLocationActions();
  const navigate = useNavigate();

  const addressTypeTags = ['HOME', 'WORK', 'OTHER'];
  const [selectedAddressType, setSelectedAddressType] = useState('HOME');

  const editingAddress =
    formType === 'edit' && editAddressId
      ? savedAddresses.find(addr => addr._id === editAddressId)
      : null;

  const [formData, setFormData] = useState({
    apartment: '',
    street: '',
    instructions: '',
    pincode: postalCode || '',
    city: city || '',
    customer_name: '',
    // customer_mobile is explicitly NOT in formData state as it's directly from AuthContext
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCityEditable, setIsCityEditable] = useState(true);
  const [isPincodeEditable, setIsPincodeEditable] = useState(true);

  const initialCityRef = useRef(city);
  const initialPincodeRef = useRef(postalCode);

  useEffect(() => {
    if (editingAddress) {
      // If editing, pre-fill form with existing address data
      setFormData({
        apartment: editingAddress.apartment || '',
        street: editingAddress.street || '',
        instructions: editingAddress.instructions || '',
        pincode: editingAddress.pincode || '',
        // Extract city from full_address, or use existing city if available
        city: editingAddress.full_address?.split(',')[2]?.trim() || editingAddress.city || '',
        customer_name: editingAddress.customer_name || '',
      });
      setSelectedAddressType(editingAddress.address_type?.toUpperCase() || 'HOME');
    } else {
      // For new address, pre-fill with provided city/pincode or user data
      setFormData(prev => ({
        ...prev,
        pincode: postalCode || prev.pincode,
        city: city || prev.city,
        customer_name: user?.name || prev.customer_name,
      }));
    }

    // Determine if city/pincode fields should be editable based on initial props
    // They are editable if initial values are not provided
    setIsCityEditable(!initialCityRef.current);
    setIsPincodeEditable(!initialPincodeRef.current);
  }, [editingAddress, postalCode, city, user]);

  const handleChange = useCallback(e => {
    const { name, value } = e.target;
    if (name === 'pincode') {
      // Allow only digits for pincode, and limit length
      const sanitizedValue = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setErrors(prev => ({ ...prev, [name]: '' })); // Clear error when input changes
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.apartment.trim()) newErrors.apartment = 'Required';
    if (!formData.street.trim()) newErrors.street = 'Required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Required';
    if (formData.pincode.trim().length !== 6) newErrors.pincode = 'Pincode must be 6 digits';
    if (!formData.city.trim()) newErrors.city = 'Required';
    if (!formData.customer_name.trim()) newErrors.customer_name = 'Required';

    // Mobile number validation is completely external and not handled here.
    // It's assumed to be verified and present in AuthContext.user.mobile_number

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditCity = () => setIsCityEditable(true);
  const handleEditPincode = () => setIsPincodeEditable(true);

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitError('');

    // Validate the form fields (excluding mobile number)
    if (!validateForm()) {
      setSubmitError('Please fill all required fields correctly.');
      return;
    }

    // CRITICAL: Ensure mobile number is available from user context for submission
    // This component relies on the parent flow ensuring user.mobile_number is set.
    if (!user?.mobile_number) {
      setSubmitError('Mobile number is missing. Please ensure you are logged in or your mobile number is verified.');
      return;
    }

    setIsSubmitting(true);

    const latValue = selectedLocation?.latitude ? parseFloat(selectedLocation.latitude) : null;
    const lonValue = selectedLocation?.longitude ? parseFloat(selectedLocation.longitude) : null;

    // Construct full address string
    const fullAddressParts = [
      formData.apartment,
      formData.street,
      formData.city,
      formData.pincode
    ];
    // Add instructions as landmark if present
    if (formData.instructions.trim()) {
      fullAddressParts.splice(2, 0, `Landmark: ${formData.instructions}`);
    }
    const fullAddressString = fullAddressParts
      .filter(val => val && val.trim() !== "") // Filter out empty or whitespace-only parts
      .join(', ');

    const addressPayload = {
      address_type: selectedAddressType.toLowerCase(),
      apartment: formData.apartment,
      street: formData.street,
      instructions: formData.instructions,
      lat: latValue,
      lon: lonValue,
      full_address: fullAddressString,
      pincode: formData.pincode,
      customer_name: formData.customer_name,
      customer_mobile: user.mobile_number, // Use the mobile number from AuthContext directly
    };

    console.log("Saving address payload:", addressPayload);
    console.log("Form type:", formType);

    try {
      if (formType === 'edit' && editAddressId) {
        // Update existing address
        await axios.put(`/user/saved-address/${editAddressId}`, addressPayload);
      } else {
        // Add new address (or update user with first saved address)
        await axios.put('/user/update', { saved_address: addressPayload });
      }

      await reload(); // Reload saved addresses in LocationContext

      if (formUsage === 'cart') {
        onAddressSavedForOrder?.(); // Callback for cart page flow
      } else {
        onSaveSuccess?.(addressPayload); // General success callback
        onClose(); // Close the address form modal
        // Navigate based on redirectType
        if (redirectType === 'cartpage') navigate('/cartpage', { replace: true });
        else navigate('/', { replace: true });
      }
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Failed to save address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Modal Overlay
    <div
      className="fixed inset-0 w-screen h-screen bg-black/50 flex justify-center items-end z-[1000] backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button on overlay */}
      <button
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 border-none rounded-full w-9 h-9 flex justify-center items-center text-2xl cursor-pointer z-[1001] text-neutral-700 leading-none shadow-md transition-all duration-200 ease-in-out hover:bg-white hover:scale-105"
        onClick={onClose}
      >
        &times;
      </button>

      {/* Modal container - fixed at bottom, scrollable */}
      <div
        className="fixed bottom-0 w-full max-w-[600px] max-h-[90vh] bg-white rounded-t-[16px] shadow-2xl overflow-y-auto z-[1000] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header - sticky on top */}
        <div className="p-[14px] px-4 text-lg font-extrabold flex items-center justify-between border-b border-gray-200 bg-white sticky top-0 z-10 text-black">
          <span>Enter Delivery Details</span>
        </div>

        {/* Form container fills available space and scrolls */}
        <form onSubmit={handleSubmit} className="p-6 px-5 flex flex-col gap-4 flex-grow min-h-0 md:p-5 md:px-4 md:gap-4">

          <div className="text-sm mb-2 font-semibold text-[#333]">Save address as *</div>
          <div className="flex flex-wrap gap-3">
            {addressTypeTags.map(tag => (
              <div
                key={tag}
                className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-sm cursor-pointer select-none transition-colors duration-300 ease-in-out shadow-sm ${selectedAddressType === tag ? 'bg-[#4CAF50] text-white font-bold shadow-md' : 'text-black bg-gray-100 hover:bg-gray-200'}`}
                onClick={() => setSelectedAddressType(tag)}
              >
                {tag}
              </div>
            ))}
          </div>

          {/* Customer Name */}
          <div className="flex flex-col w-full relative">
            <label className="text-[15px] mt-1 text-[#333] pointer-events-none mb-1 font-medium">Name *</label>
            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              className="px-3.5 py-2.5 border border-[#ccc] rounded-lg text-sm w-full outline-none transition-all duration-300 ease-in-out focus:border-[#4CAF50] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(76,175,80,0.2)] text-black"
            />
            {errors.customer_name && <div className="text-xs text-[#d32f2f] mt-1 font-medium">{errors.customer_name}</div>}
          </div>

          {/* Mobile number input is now COMPLETELY REMOVED from the UI.
              It will be sourced directly from AuthContext.user.mobile_number for submission. */}


          {/* Address Fields - Mapped to schema names */}
          <div className="flex flex-col w-full relative ">
            <label className="text-[15px] mt-1 text-[#333] pointer-events-none mb-1 font-medium">Flat/House No./Building Name *</label>
            <input
              type="text"
              name="apartment"
              value={formData.apartment}
              onChange={handleChange}
              className="px-3.5 py-2.5 border border-[#ccc] rounded-lg text-sm w-full outline-none transition-all duration-300 ease-in-out focus:border-[#4CAF50] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(76,175,80,0.2)] text-black"
            />
            {errors.apartment && <div className="text-xs text-[#d32f2f] mt-1 font-medium">{errors.apartment}</div>}
          </div>

          <div className="flex flex-col w-full relative">
            <label className="text-[15px] mt-1 text-[#333] pointer-events-none mb-1 font-medium">Street Name *</label>
            <textarea
              name="street"
              value={formData.street}
              onChange={handleChange}
              rows="2"
              className="px-3.5 py-2.5 border border-[#ccc] rounded-lg text-sm w-full outline-none transition-all duration-300 ease-in-out focus:border-[#4CAF50] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(76,175,80,0.2)] resize-none text-black"
            />
            {errors.street && <div className="text-xs text-[#d32f2f] mt-1 font-medium">{errors.street}</div>}
          </div>

          <div className="flex flex-col w-full relative">
            <label className="text-[15px] mt-1 text-[#333] pointer-events-none mb-1 font-medium">Delivery Instructions / Nearby Landmark (optional)</label>
            <input
              type="text"
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              className="px-3.5 py-2.5 border border-[#ccc] rounded-lg text-sm w-full outline-none transition-all duration-300 ease-in-out focus:border-[#4CAF50] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(76,175,80,0.2)] text-black"
            />
          </div>

          {/* City */}
          <div className="flex flex-col w-full relative">
            <label className="text-[15px] mt-1 text-[#333] pointer-events-none mb-1 font-medium">City *</label>
            <div className="flex items-center relative w-full">
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!isCityEditable}
                className={`flex-grow px-3.5 py-2.5 border border-[#ccc] rounded-lg text-sm w-full outline-none transition-all duration-300 ease-in-out focus:border-[#4CAF50] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(76,175,80,0.2)] ${!isCityEditable ? 'bg-[#f0f0f0] text-[#777] cursor-not-allowed' : 'text-black'}`}
              />
              {!isCityEditable && (
                <button type="button" onClick={handleEditCity} className="absolute right-2.5 bg-transparent border-none cursor-pointer flex items-center justify-center w-7 h-7 text-[#666] transition-colors duration-200 ease-in-out hover:text-[#4CAF50] hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.187 1.187 3.712 3.712 1.187-1.187a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
                    <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
                  </svg>
                </button>
              )}
            </div>
            {errors.city && <div className="text-xs text-[#d32f2f] mt-1 font-medium">{errors.city}</div>}
          </div>

          {/* Pincode */}
          <div className="flex flex-col w-full relative">
            <label className="text-[15px] mt-1 text-[#333] pointer-events-none mb-1 font-medium">Pincode *</label>
            <div className="flex items-center relative w-full">
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                disabled={!isPincodeEditable}
                className={`flex-grow px-3.5 py-2.5 border border-[#ccc] rounded-lg text-sm w-full outline-none transition-all duration-300 ease-in-out focus:border-[#4CAF50] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(76,175,80,0.2)] ${!isPincodeEditable ? 'bg-[#f0f0f0] text-[#777] cursor-not-allowed' : 'text-black'}`}
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength="6"
              />
              {!isPincodeEditable && (
                <button type="button" onClick={handleEditPincode} className="absolute right-2.5 bg-transparent border-none cursor-pointer flex items-center justify-center w-7 h-7 text-[#666] transition-colors duration-200 ease-in-out hover:text-[#4CAF50] hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.187 1.187 3.712 3.712 1.187-1.187a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
                    <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
                  </svg>
                </button>
              )}
            </div>
            {errors.pincode && <div className="text-xs text-[#d32f2f] mt-1 font-medium">{errors.pincode}</div>}
          </div>

          {/* Sticky Footer */}
          <div className="p-4 px-5 border-t border-[#eee] bg-white sticky bottom-0 w-full z-10 shadow-[0_-4px_6px_rgba(0,0,0,0.05)] mt-auto">
            <button
              type="submit"
              className="w-full bg-[#4CAF50] border-none text-white text-base py-3.5 rounded-lg cursor-pointer font-bold transition-all duration-300 ease-in-out shadow-[0_2px_5px_rgba(0,0,0,0.2)] disabled:bg-[#a5d6a7] disabled:cursor-not-allowed hover:bg-[#388E3C] hover:translate-y-px"
              disabled={isSubmitting}
            >
              {formUsage === 'cart'
                ? (isSubmitting ? 'Saving Address...' : 'Confirm and Place Order')
                : (isSubmitting ? 'Saving...' : 'Save Address')}
            </button>
            {submitError && <div className="text-xs text-[#d32f2f] text-center mt-2 p-2 bg-[#ffebee] border border-[#d32f2f] rounded-md">{submitError}</div>}
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddressForm;