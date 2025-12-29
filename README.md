# Academic Reference Catalogue

A web-based reference management application for organizing journal articles, books, and reports with support for multiple citation styles.

## Features

- 📚 **Comprehensive Reference Management**: Add, edit, and organize journal articles, books, and reports
- 📄 **PDF Upload**: Upload PDF files and extract metadata automatically
- 🔍 **Powerful Search & Filtering**: Search by title, author, journal, and filter by type and tags
- 🏷️ **Tagging System**: Organize references with custom tags
- 📝 **Multiple Citation Styles**: Generate citations in APA, MLA, Chicago, Harvard, and Vancouver formats
- 💾 **Persistent Storage**: All references saved in browser storage
- 📤 **Export Functionality**: Export formatted citations as text files
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Live Demo

Visit the live application at: `https://yourusername.github.io/repository-name`

## Local Development

To run this application locally:

1. Clone this repository
2. Open `index.html` in your web browser
3. Start adding references!

No build process or dependencies required - it runs entirely in the browser.

## Deployment to GitHub Pages

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **+** icon in the top right and select "New repository"
3. Name your repository (e.g., `reference-manager`)
4. Choose "Public" (required for free GitHub Pages)
5. Click "Create repository"

### Step 2: Upload Your Files

1. On your new repository page, click "uploading an existing file"
2. Drag and drop these files:
   - `index.html`
   - `reference-manager.jsx`
   - `README.md`
3. Click "Commit changes"

### Step 3: Enable GitHub Pages

1. In your repository, go to **Settings** (top menu)
2. Click **Pages** in the left sidebar
3. Under "Source", select **Deploy from a branch**
4. Under "Branch", select **main** (or **master**) and **/ (root)**
5. Click **Save**

### Step 4: Access Your App

After a few minutes, your app will be live at:
```
https://yourusername.github.io/repository-name
```

The URL will be shown at the top of the Pages settings.

## Usage Guide

### Adding a Reference

1. Click **"Add New Reference"**
2. Select the reference type (Article, Book, Report, or Other)
3. Upload a PDF (optional) - the app will attempt to extract metadata
4. Fill in the bibliographic details
5. Add tags for organization (comma-separated)
6. Add personal notes if desired
7. Click **"Add Reference"**

### Searching and Filtering

- Use the search bar to find references by title, author, or journal
- Filter by reference type using the dropdown
- Filter by tags to view specific categories

### Changing Citation Style

- Select your preferred citation style (APA, MLA, Chicago, Harvard, Vancouver) from the dropdown
- Citations in reference cards update automatically
- Export uses the selected style

### Exporting Citations

1. Select your desired citation style
2. Apply any filters to show only the references you want
3. Click **"Export Citations"**
4. A text file will download with all formatted citations

## Data Storage

All data is stored locally in your browser using the Web Storage API. Your references will persist across sessions, but are specific to:
- The browser you're using
- The device you're on
- The domain/URL you're accessing the app from

**To backup your data**: Export your citations regularly, or use your browser's export feature to save the storage data.

## Browser Compatibility

This app works best on modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

## Privacy

All your data stays on your device. Nothing is sent to external servers. Your PDFs and references are completely private.

## Contributing

Feel free to fork this repository and submit pull requests for improvements!

## License

MIT License - feel free to use and modify for your own needs.

## Support

If you encounter any issues or have suggestions, please open an issue on GitHub.

---

Built with React, Lucide Icons, and lots of ☕