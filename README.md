# SelectCare Browser Extension

A powerful Chrome extension for intelligent text selection and management. SelectCare allows users to capture, categorize, and interact with selected text through an intuitive popup interface.

## ✨ Features

### 🎯 **Smart Text Selection**
- **Instant Popup**: Beautiful glassmorphism popup appears when text is selected
- **Three Action Types**: Remember words for translation, save as notes, or ask AI questions
- **Smooth Animations**: Cubic-bezier transitions with bounce effects

### 🏷️ **Advanced Tag System**
- **Flexible Tagging**: Support for multi-word tags like `machine learning` or `front end development`
- **Visual Tag Chips**: Blue animated chips with edit and remove functionality
- **Real-time Input**: Type any text and press Enter to create tags
- **Tag Management**: Click to edit, remove with × button, or use backspace when input is empty

### ⌨️ **Smart Keyboard Handling**
- **Shortcut Prevention**: Prevents webpage shortcuts (like X.com's "n" key) from interfering
- **Custom Event System**: Advanced keyboard event handling through Shadow DOM
- **Focus Management**: Intelligent detection of user typing states

### 🎨 **Modern UI Design**
- **Glassmorphism**: Translucent backgrounds with backdrop blur effects
- **Responsive**: Adapts to different screen sizes and positions
- **Accessibility**: Proper focus states and keyboard navigation
- **Consistent Styling**: Apple-inspired design language throughout

## 🚀 Quick Start

### Installation
1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Usage
1. **Select Text**: Highlight any text on a webpage
2. **Choose Action**: Click one of three buttons:
   - 🌐 **Remember**: Translate and save new words
   - 📝 **Note**: Save selection with tags
   - 🤖 **Ask AI**: Get AI insights about the text
3. **Add Details**: Fill in the form popup with relevant information
4. **Save**: Your selection is processed and stored

## 📋 Action Types

### 🌐 Remember (Translation)
- **Purpose**: Save words/phrases for language learning
- **Input**: Target language (defaults to English)
- **Use Case**: Building vocabulary, learning new terms

### 📝 Note
- **Purpose**: Save text selections with categorized tags
- **Input**: Flexible tag system (no prefix required)
- **Use Case**: Research, bookmarking, content organization

### 🤖 Ask AI
- **Purpose**: Get AI analysis or explanation of selected text
- **Input**: Custom question about the selection
- **Use Case**: Understanding complex concepts, getting summaries

## 🛠️ Technical Architecture

### **Component Structure**
```
content_scripts/
├── content.ts              # Main content script
├── components/
│   └── TagInput.ts         # Reusable tag input component
├── utils.ts                # Utility functions
└── data_mapper.ts          # Data transformation
```

### **Key Technologies**
- **TypeScript**: Full type safety with discriminated unions
- **Shadow DOM**: Style encapsulation and isolation
- **Custom Events**: Advanced keyboard event handling
- **CSS Animations**: Smooth transitions and micro-interactions
- **Chrome Extension APIs**: Content scripts and background workers

### **Event System**
```typescript
// Custom keyboard event handling
tagInput.dispatchKeyEvent(key, { ctrlKey, metaKey, altKey, shiftKey });

// Real-time callbacks
onInputChange: (value) => console.log('User typing:', value)
onTagsChange: (tags) => console.log('Tags updated:', tags)
```

## 🔧 Development

### **Build Commands**
```bash
# Development build with watch mode
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

### **Project Structure**
```
select-care-extension/
├── src/
│   ├── content_scripts/     # Content script functionality
│   ├── extension_popup/     # Extension popup UI
│   ├── service_worker/      # Background script
│   └── types/              # TypeScript definitions
├── public/                 # Static assets and manifest
└── dist/                   # Built extension files
```

## 🎛️ Configuration

### **Manifest Configuration**
The extension uses Manifest V3 with these key permissions:
- `activeTab`: Access to current tab content
- `storage`: Local data persistence
- `scripting`: Content script injection

### **Tag Input Options**
```typescript
new TagInput({
  placeholder: 'Type tag name and press Enter...',
  maxTags: 10,
  allowDuplicates: false,
  onTagsChange: (tags) => handleTagChange(tags),
  onInputChange: (value) => handleInput(value)
});
```

## 🐛 Troubleshooting

### **Common Issues**
1. **Tags not creating**: Ensure you press Enter after typing
2. **Popup not appearing**: Check if text is properly selected
3. **Keyboard shortcuts interfering**: The extension automatically handles this

### **Debugging**
- Open Chrome DevTools → Console to see extension logs
- Check `chrome://extensions/` for error messages
- Verify extension is enabled and permissions granted

## 🔮 Future Enhancements

- [ ] **Backend Integration**: API calls for translation and AI services
- [ ] **Data Synchronization**: Cloud storage and cross-device sync
- [ ] **Export Features**: Export notes and tags to various formats
- [ ] **Advanced Search**: Search through saved selections and notes
- [ ] **Themes**: Multiple UI themes and customization options

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📧 Support

For questions, bug reports, or feature requests, please open an issue on GitHub.

---

**Made with ❤️ for better text management and learning**
