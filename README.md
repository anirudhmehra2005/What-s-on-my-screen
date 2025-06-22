# What's On My Screen - Chrome Extension

A Chrome extension that provides instant AI-powered explanations of any text you select on webpages using Google's Gemini API.

## Features

- **Right-click Context Menu**: Select any text and right-click to see "Explain with AI"
- **Instant AI Analysis**: Get explanations, definitions, and simplifications powered by Google Gemini
- **Professional UI**: Clean, modern popup interface with smooth animations
- **Rate Limiting**: 10 requests per hour (free tier)
- **Privacy First**: No data collection, anonymous usage
- **Cross-platform**: Works on all websites

## Installation

### Development Installation

1. **Clone or download** this repository
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer mode** (toggle in top right)
4. **Click "Load unpacked"** and select the extension folder
5. **Get a Google Gemini API key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key (free tier: 1500 requests/day)
6. **Configure the extension**:
   - Click the extension icon in your toolbar
   - Enter your API key and click "Save"

### Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store for easy installation.

## Usage

1. **Select text** on any webpage
2. **Right-click** and choose "Explain with AI"
3. **Wait for analysis** (usually 2-3 seconds)
4. **Read the explanation** in the popup
5. **Click outside or press Escape** to close

## File Structure

```
whats-on-my-screen/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (API calls, context menu)
├── content.js            # Content script (text selection, popup display)
├── popup.html            # Extension popup interface
├── popup.css             # Popup styling
├── popup.js              # Popup functionality
├── styles.css            # Main popup styling
└── README.md             # This file
```

## API Key Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Open the extension popup and paste the key
6. Click "Save API Key"

## Rate Limits

- **Free tier**: 10 requests per hour
- **Paid tier**: 1500 requests per day
- **Reset time**: Every hour on the hour

## Privacy & Security

- **No data storage**: Selected text is processed and discarded
- **Anonymous usage**: No user tracking or identification
- **Local storage**: API key stored locally in your browser
- **HTTPS only**: All API communications are encrypted

## Troubleshooting

### Extension not working?
- Check that you've entered a valid API key
- Ensure you're on a supported website
- Try refreshing the page

### API errors?
- Verify your API key is correct
- Check your internet connection
- Ensure you haven't exceeded rate limits

### Popup not appearing?
- Make sure text is selected
- Check that the extension is enabled
- Try right-clicking on the selected text

## Development

### Prerequisites
- Chrome browser
- Google Gemini API key
- Basic knowledge of Chrome extensions

### Local Development
1. Make changes to the code
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension
4. Test your changes

### Building for Production
1. Update version in `manifest.json`
2. Test thoroughly
3. Package for Chrome Web Store submission

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
- Check the troubleshooting section above
- Open an issue on GitHub
- Contact the development team

---

**Note**: This extension requires a Google Gemini API key to function. The free tier provides 1500 requests per day, which is sufficient for most users. 