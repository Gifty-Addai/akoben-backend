import express from 'express';
import {
    createGalleryItem,
    getAllGalleryItems,
    getGalleryItemById,
    updateGalleryItem,
    deleteGalleryItem,
    searchGalleryItems,
} from '../controllers/gallery.controller.js';

const route = express.Router();


route.post("/createGalleryItem", createGalleryItem)
route.get("/getAllGalleryItems", getAllGalleryItems)
route.get("/getGalleryItemById/:id", getGalleryItemById)
route.post("/updateGalleryItem/:id", updateGalleryItem)
route.delete("/deleteGalleryItem/:id", deleteGalleryItem)
route.post("/searchGalleryItems", searchGalleryItems)

export default route;