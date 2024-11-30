import Gallery from '../models/gallery.model.js';

export const createGalleryItem = async (req, res, next) => {
  const { title, description, imageUrl, createdBy } = req.body;

  if (!title || !description || !imageUrl || !createdBy) {
    return res.status(400).json({ message: "Title, description, imageUrl, and createdBy are required." });
  }

  try {
    const galleryItem = new Gallery({
      title,
      description,
      imageUrl,
      createdBy,
    });

    await galleryItem.save();
    res.status(201).json({ message: 'Gallery item created successfully!', galleryItem });
  } catch (error) {
    next(error);
  }
};


export const getAllGalleryItems = async (req, res, next) => {
    try {
      const galleryItems = await Gallery.find().populate('createdBy', 'name email');
      res.status(200).json(galleryItems);
    } catch (error) {
      next(error);
    }
  };

  
  export const getGalleryItemById = async (req, res, next) => {
    const { id } = req.params;
  
    try {
      const galleryItem = await Gallery.findById(id).populate('createdBy', 'name email');
  
      if (!galleryItem) {
        return res.status(404).json({ message: `Gallery item with id: ${id} not found` });
      }
  
      res.status(200).json(galleryItem);
    } catch (error) {
      next(error);
    }
  };

  
  export const updateGalleryItem = async (req, res, next) => {
    const { id } = req.params;
    const { title, description, imageUrl } = req.body;
  
    if (!title && !description && !imageUrl) {
      return res.status(400).json({ message: "At least one field (title, description, imageUrl) must be provided to update." });
    }
  
    try {
      const updatedGalleryItem = await Gallery.findByIdAndUpdate(
        id,
        { $set: { title, description, imageUrl } },
        { new: true }
      );
  
      if (!updatedGalleryItem) {
        return res.status(404).json({ message: `Gallery item with id: ${id} not found` });
      }
  
      res.status(200).json({ message: 'Gallery item updated successfully!', galleryItem: updatedGalleryItem });
    } catch (error) {
      next(error);
    }
  };

  
  export const deleteGalleryItem = async (req, res, next) => {
    const { id } = req.params;
  
    try {
      const deletedGalleryItem = await Gallery.findByIdAndDelete(id);
  
      if (!deletedGalleryItem) {
        return res.status(404).json({ message: `Gallery item with id: ${id} not found` });
      }
  
      res.status(200).json({ message: 'Gallery item deleted successfully!' });
    } catch (error) {
      next(error);
    }
  };

  
  export const searchGalleryItems = async (req, res, next) => {
    const { title, description, createdBy } = req.query;
  
    try {
      const filters = {};
  
      if (title) filters.title = { $regex: title, $options: 'i' }; // Case-insensitive search
      if (description) filters.description = { $regex: description, $options: 'i' };
      if (createdBy) filters.createdBy = createdBy;
  
      const galleryItems = await Gallery.find(filters).populate('createdBy', 'name email');
      res.status(200).json(galleryItems);
    } catch (error) {
      next(error);
    }
  };
  