import Settings from '../models/settings.model.js';
import ApiResponse from '../lib/api-reponse.util.js';

export const getSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({});
            await settings.save();
        }
        return ApiResponse.sendSuccess(res, "Settings fetched successfully", settings);
    } catch (error) {
        next(error);
    }
};

export const updateSettings = async (req, res, next) => {
    try {
        const { whatsappNumber, supportEmail, supportPhone, promoMessage, promoEnabled, instagramLink, linkedinLink } = req.body;
        
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({});
        }

        if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber;
        if (supportEmail !== undefined) settings.supportEmail = supportEmail;
        if (supportPhone !== undefined) settings.supportPhone = supportPhone;
        if (promoMessage !== undefined) settings.promoMessage = promoMessage;
        if (promoEnabled !== undefined) settings.promoEnabled = promoEnabled;
        if (instagramLink !== undefined) settings.instagramLink = instagramLink;
        if (linkedinLink !== undefined) settings.linkedinLink = linkedinLink;

        await settings.save();

        return ApiResponse.sendSuccess(res, "Settings updated successfully", settings);
    } catch (error) {
        next(error);
    }
};
