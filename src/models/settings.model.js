import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    whatsappNumber: {
        type: String,
        default: '233247413964'
    },
    supportEmail: {
        type: String,
        default: 'info@ancestraltallow.gh'
    },
    supportPhone: {
        type: String,
        default: '+233 24 741 3964'
    },
    promoMessage: {
        type: String,
        default: 'VALENTINE\'S DAY OFFER 💝 - FLAT 25% OFF - USE CODE "SELFLOVE25"'
    },
    promoEnabled: {
        type: Boolean,
        default: true
    },
    instagramLink: {
        type: String,
        default: 'https://www.instagram.com/outdoorscamps?igsh=MnF5YmRlbjA2YWd3'
    },
    linkedinLink: {
        type: String,
        default: 'https://linkedin.com'
    }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
