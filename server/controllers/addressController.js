const Address = require('../models/Address');

exports.getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({
      isDefault: -1,
      updatedAt: -1,
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      addresses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAddress = async (req, res) => {
  try {
    const existingCount = await Address.countDocuments({ user: req.user._id });
    const shouldBeDefault = req.body.isDefault || existingCount === 0;

    if (shouldBeDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      ...req.body,
      user: req.user._id,
      isDefault: shouldBeDefault
    });

    res.status(201).json({
      success: true,
      address
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.addressId, user: req.user._id });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    Object.assign(address, req.body);
    await address.save();

    res.status(200).json({
      success: true,
      address
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.addressId,
      user: req.user._id
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (address.isDefault) {
      const fallbackAddress = await Address.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      if (fallbackAddress) {
        fallbackAddress.isDefault = true;
        await fallbackAddress.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
